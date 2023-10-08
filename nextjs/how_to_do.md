# **■ReactでclassList.toggle('active')をしたい場合はどうする？**


<details><summary>sample code</summary>

```ts
function MyComponent () {
  const [active, setActive] = useState(false);

  return (
    <div className={active ? 'active' : ''}>
      <button onClick={() => setActive(!active)}>Toggle</button>
    </div>
  )
}
```
</details>

[stack overflow](https://stackoverflow.com/questions/71013431/how-to-apply-classlist-toggleactive-in-reactjs)