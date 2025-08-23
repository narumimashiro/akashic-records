import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transform, Readable } from 'stream';
import { pipeline } from 'stream/promises';
import * as csv from 'csv-stringify';

export interface CsvExportOptions {
  batchSize?: number;
  filters?: Record<string, any>;
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  fields?: string[];
}

@Injectable()
export class CsvExportService {
  private readonly logger = new Logger(CsvExportService.name);
  private readonly DEFAULT_BATCH_SIZE = 1000;

  constructor(
    @InjectRepository(YourEntity) // 実際のエンティティ名に置き換えてください
    private readonly repository: Repository<YourEntity>,
  ) {}

  /**
   * 大量データ用のストリーミングCSVエクスポート
   */
  async createCsvStream(options: CsvExportOptions = {}): Promise<Readable> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      filters = {},
      orderBy = { field: 'id', direction: 'ASC' },
      fields = ['id', 'name', 'email', 'createdAt'], // デフォルトフィールド
    } = options;

    this.logger.log(`Starting CSV export with batch size: ${batchSize}`);

    // CSVヘッダーの定義
    const headers = this.getHeaders(fields);
    
    let offset = 0;
    let hasMoreData = true;
    let isFirstBatch = true;

    // データをバッチで取得するストリーム
    const dataStream = new Readable({
      objectMode: true,
      async read() {
        if (!hasMoreData) {
          this.push(null); // ストリーム終了
          return;
        }

        try {
          const queryBuilder = this.buildQuery(filters, fields);
          const data = await queryBuilder
            .orderBy(`entity.${orderBy.field}`, orderBy.direction)
            .skip(offset)
            .take(batchSize)
            .getMany();

          // 最初のバッチでヘッダーを送信
          if (isFirstBatch) {
            this.push(headers);
            isFirstBatch = false;
          }

          if (data.length === 0) {
            hasMoreData = false;
            this.push(null);
            return;
          }

          // データを1件ずつプッシュ
          for (const item of data) {
            this.push(this.transformToRow(item, fields));
          }

          offset += batchSize;
          
          // バッチサイズより少ない場合は最後のバッチ
          if (data.length < batchSize) {
            hasMoreData = false;
          }

          this.logger.debug(`Processed batch: offset=${offset}, count=${data.length}`);
          
        } catch (error) {
          this.logger.error('Error in data stream:', error);
          this.emit('error', error);
        }
      },
    });

    // CSV変換ストリーム
    const csvTransform = csv({
      header: false, // ヘッダーは手動で管理
      quoted: true,
      quoted_empty: true,
      quoted_string: true,
    });

    return dataStream.pipe(csvTransform);
  }

  /**
   * 非同期ジェネレータを使った実装（メモリ効率最適化版）
   */
  async *generateCsvRows(options: CsvExportOptions = {}): AsyncGenerator<string> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      filters = {},
      orderBy = { field: 'id', direction: 'ASC' },
      fields = ['id', 'name', 'email', 'createdAt'],
    } = options;

    // ヘッダー行を最初に yield
    const headers = this.getHeaders(fields);
    yield this.arrayToCsvRow(headers);

    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      try {
        const queryBuilder = this.buildQuery(filters, fields);
        const data = await queryBuilder
          .orderBy(`entity.${orderBy.field}`, orderBy.direction)
          .skip(offset)
          .take(batchSize)
          .getMany();

        if (data.length === 0) {
          hasMoreData = false;
          break;
        }

        // データを1行ずつyield
        for (const item of data) {
          const row = this.transformToRow(item, fields);
          yield this.arrayToCsvRow(row);
        }

        offset += batchSize;
        
        if (data.length < batchSize) {
          hasMoreData = false;
        }

        this.logger.debug(`Generated batch: offset=${offset}, count=${data.length}`);
        
      } catch (error) {
        this.logger.error('Error generating CSV rows:', error);
        throw error;
      }
    }

    this.logger.log(`CSV generation completed. Total processed: ${offset}`);
  }

  /**
   * カーソルベースのページネーション（超大規模データ用）
   */
  async *generateCsvRowsWithCursor(options: CsvExportOptions & { cursorField?: string } = {}): AsyncGenerator<string> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      filters = {},
      fields = ['id', 'name', 'email', 'createdAt'],
      cursorField = 'id',
    } = options;

    const headers = this.getHeaders(fields);
    yield this.arrayToCsvRow(headers);

    let cursor: any = null;
    let hasMoreData = true;
    let totalProcessed = 0;

    while (hasMoreData) {
      try {
        const queryBuilder = this.buildQuery(filters, fields);
        
        if (cursor !== null) {
          queryBuilder.andWhere(`entity.${cursorField} > :cursor`, { cursor });
        }

        const data = await queryBuilder
          .orderBy(`entity.${cursorField}`, 'ASC')
          .take(batchSize)
          .getMany();

        if (data.length === 0) {
          hasMoreData = false;
          break;
        }

        for (const item of data) {
          const row = this.transformToRow(item, fields);
          yield this.arrayToCsvRow(row);
        }

        // 次のカーソルを設定
        cursor = data[data.length - 1][cursorField];
        totalProcessed += data.length;
        
        if (data.length < batchSize) {
          hasMoreData = false;
        }

        this.logger.debug(`Cursor batch processed: cursor=${cursor}, count=${data.length}, total=${totalProcessed}`);
        
      } catch (error) {
        this.logger.error('Error in cursor-based generation:', error);
        throw error;
      }
    }

    this.logger.log(`Cursor-based CSV generation completed. Total processed: ${totalProcessed}`);
  }

  /**
   * データ件数を取得（プログレス表示用）
   */
  async getDataCount(filters: Record<string, any> = {}): Promise<number> {
    const queryBuilder = this.buildQuery(filters, ['id']);
    return await queryBuilder.getCount();
  }

  private buildQuery(filters: Record<string, any>, fields: string[]): SelectQueryBuilder<YourEntity> {
    const queryBuilder = this.repository
      .createQueryBuilder('entity')
      .select(fields.map(field => `entity.${field}`));

    // フィルター条件を追加
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryBuilder.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });
        } else if (typeof value === 'string' && value.includes('%')) {
          queryBuilder.andWhere(`entity.${key} LIKE :${key}`, { [key]: value });
        } else {
          queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      }
    });

    return queryBuilder;
  }

  private getHeaders(fields: string[]): string[] {
    const headerMapping: Record<string, string> = {
      id: 'ID',
      name: '名前',
      email: 'メールアドレス',
      createdAt: '作成日時',
      updatedAt: '更新日時',
      status: 'ステータス',
      // 必要に応じて追加
    };

    return fields.map(field => headerMapping[field] || field);
  }

  private transformToRow(item: any, fields: string[]): string[] {
    return fields.map(field => {
      let value = item[field];
      
      // データ型に応じた変換
      if (value === null || value === undefined) {
        return '';
      }
      
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      return String(value);
    });
  }

  private arrayToCsvRow(row: string[]): string {
    return row
      .map(cell => {
        // CSVエスケープ処理
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      })
      .join(',') + '\n';
  }
}