import { 
  Controller, 
  Get, 
  Query, 
  Res, 
  Post,
  Body,
  Header,
  HttpException,
  HttpStatus,
  Logger,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, interval, map } from 'rxjs';
import { CsvExportService, CsvExportOptions } from './csv-export.service';

interface ExportRequest {
  filters?: Record<string, any>;
  fields?: string[];
  batchSize?: number;
  orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  useCursor?: boolean;
}

@Controller('export')
export class CsvExportController {
  private readonly logger = new Logger(CsvExportController.name);

  constructor(private readonly csvExportService: CsvExportService) {}

  /**
   * ストリーミングCSVダウンロード（推奨方法）
   */
  @Post('csv/stream')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Transfer-Encoding', 'chunked')
  async streamCsv(
    @Body() exportRequest: ExportRequest,
    @Res() res: Response,
  ): Promise<void> {
    const {
      filters = {},
      fields = ['id', 'name', 'email', 'createdAt'],
      batchSize = 1000,
      orderBy = { field: 'id', direction: 'ASC' },
      useCursor = false,
    } = exportRequest;

    try {
      // ファイル名を設定
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `export_${timestamp}.csv`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      this.logger.log(`Starting CSV export: ${JSON.stringify({ filters, fields, batchSize })}`);

      const options: CsvExportOptions = {
        filters,
        fields,
        batchSize,
        orderBy,
      };

      if (useCursor) {
        // カーソルベース（超大規模データ用）
        const generator = this.csvExportService.generateCsvRowsWithCursor(options);
        
        for await (const row of generator) {
          if (!res.write(row)) {
            // バックプレッシャー対応
            await new Promise(resolve => res.once('drain', resolve));
          }
        }
      } else {
        // 通常のオフセットベース
        const generator = this.csvExportService.generateCsvRows(options);
        
        for await (const row of generator) {
          if (!res.write(row)) {
            // バックプレッシャー対応
            await new Promise(resolve => res.once('drain', resolve));
          }
        }
      }

      res.end();
      this.logger.log('CSV export completed successfully');

    } catch (error) {
      this.logger.error('CSV export failed:', error);
      
      if (!res.headersSent) {
        res.status(500).json({ error: 'CSV export failed' });
      } else {
        res.end('\n# Export failed due to server error');
      }
    }
  }

  /**
   * Node.js Streamを使った実装
   */
  @Post('csv/stream-native')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Transfer-Encoding', 'chunked')
  async streamCsvNative(
    @Body() exportRequest: ExportRequest,
    @Res() res: Response,
  ): Promise<void> {
    const options: CsvExportOptions = {
      filters: exportRequest.filters || {},
      fields: exportRequest.fields || ['id', 'name', 'email', 'createdAt'],
      batchSize: exportRequest.batchSize || 1000,
      orderBy: exportRequest.orderBy || { field: 'id', direction: 'ASC' },
    };

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `export_${timestamp}.csv`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const csvStream = await this.csvExportService.createCsvStream(options);
      
      // エラーハンドリング
      csvStream.on('error', (error) => {
        this.logger.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'CSV export failed' });
        }
      });

      // ストリームをレスポンスにパイプ
      csvStream.pipe(res);

    } catch (error) {
      this.logger.error('CSV stream setup failed:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'CSV export setup failed' });
      }
    }
  }

  /**
   * プログレス付きエクスポート（SSE使用）
   */
  @Sse('csv/export-progress')
  async exportWithProgress(
    @Query() query: any,
  ): Promise<Observable<MessageEvent>> {
    const filters = JSON.parse(query.filters || '{}');
    const fields = JSON.parse(query.fields || '["id", "name", "email", "createdAt"]');
    const batchSize = parseInt(query.batchSize || '1000');

    return new Observable<MessageEvent>(observer => {
      const runExport = async () => {
        try {
          // まず総件数を取得
          const totalCount = await this.csvExportService.getDataCount(filters);
          
          observer.next({
            data: JSON.stringify({
              type: 'start',
              totalCount,
              message: 'エクスポートを開始します...',
            }),
          } as MessageEvent);

          const options: CsvExportOptions = { filters, fields, batchSize };
          const generator = this.csvExportService.generateCsvRows(options);
          
          let processedCount = 0;
          let csvContent = '';

          for await (const row of generator) {
            csvContent += row;
            
            // ヘッダー行以外をカウント
            if (processedCount > 0 || !row.includes('ID')) {
              processedCount++;
            }

            // 進捗を定期的に送信（100件ごと）
            if (processedCount % 100 === 0) {
              const progress = Math.round((processedCount / totalCount) * 100);
              observer.next({
                data: JSON.stringify({
                  type: 'progress',
                  processedCount,
                  totalCount,
                  progress,
                  message: `${processedCount}/${totalCount} 件処理中...`,
                }),
              } as MessageEvent);
            }
          }

          // 完了通知
          observer.next({
            data: JSON.stringify({
              type: 'complete',
              processedCount,
              totalCount,
              csvContent: Buffer.from(csvContent).toString('base64'), // Base64エンコード
              filename: `export_${new Date().toISOString().split('T')[0]}.csv`,
              message: 'エクスポートが完了しました',
            }),
          } as MessageEvent);

          observer.complete();

        } catch (error) {
          this.logger.error('Progress export failed:', error);
          observer.next({
            data: JSON.stringify({
              type: 'error',
              message: 'エクスポートに失敗しました',
              error: error.message,
            }),
          } as MessageEvent);
          observer.error(error);
        }
      };

      runExport();
    });
  }

  /**
   * エクスポート件数の事前確認
   */
  @Get('csv/count')
  async getExportCount(@Query() filters: any): Promise<{ count: number }> {
    try {
      const count = await this.csvExportService.getDataCount(filters);
      return { count };
    } catch (error) {
      this.logger.error('Failed to get export count:', error);
      throw new HttpException(
        'Failed to get export count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 利用可能なフィールド一覧を取得
   */
  @Get('csv/fields')
  getAvailableFields() {
    return {
      fields: [
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'name', label: '名前', type: 'string' },
        { key: 'email', label: 'メールアドレス', type: 'string' },
        { key: 'status', label: 'ステータス', type: 'string' },
        { key: 'createdAt', label: '作成日時', type: 'datetime' },
        { key: 'updatedAt', label: '更新日時', type: 'datetime' },
        // 必要に応じて追加
      ],
    };
  }
}