class ESFor {
    easyFront: any = {}
    constructor(father) {
        this.easyFront = father
        console.log(this.easyFront)
        
        this,this.makeForTemplete()
    }
    makeForTemplete() {
        let forInfo = document.querySelectorAll("[e-for]")
        console.log(forInfo)
        this.ForTempleteReplace(forInfo)
    }
    ForTempleteReplace(forInfo) {
        console.log(forInfo)
        for (const dom of forInfo) {
            let valName = dom.getAttribute("e-for")
            let child = dom.children[0]
            this.doForTemplete(valName, child, dom)
            dom.removeChild(child)
            this.easyFront.EFVal.pushValChangeCallBack(valName, child ,(child, newVal)=>{
                dom.innerHTML = ""
                this.doForTemplete(valName, child, dom)
            })
        }
    }
    doForTemplete(valName: string, child: any, dom: any) {
        let index = 0
        for (const item of this.easyFront.EFVal._data[valName]) {
            item.index = index++
            let new_child = child.cloneNode(true)
            let vals = new_child.querySelectorAll("[e-for-data]")
            for (const dom of vals) {
                let valName = dom.getAttribute("e-for-data")
                dom.innerText = eval(`${valName}`)
            }
            let clicks = new_child.querySelectorAll("[e-for-click]")
            for (const click of clicks) {
                click.addEventListener('click',() => {
                    console.log(item)
                    let fun = click.getAttribute("e-for-click")
                    eval(`${fun}`)
                 })
            }
            dom.appendChild(new_child)
        }
    }
}
export default ESFor