App **json10**

Handle circural references, comments and many more inside JSON:


<details>
<summary>json10 component</summary>

```ts
//#region @browser
@Component({ template: 'hello world fromr json10' })
export class Json10Component {}
//#endregion
```

</details>


<details>
<summary>json10 module</summary>

```ts
//#region @browser
@NgModule({
  declarations: [Json10Component],
  imports: [CommonModule],
  exports: [Json10Component],
})
export class Json10Module {}
//#endregion
```

</details>



