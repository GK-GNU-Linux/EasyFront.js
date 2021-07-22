class ValEngine {
    _data: Object = {}
    data: Object = {}
    modelValChangeCallBack: Object = {}
    constructor() {
        this._data = {}
        this.data = {}
        this.modelValChangeCallBack = {}
        this.createVar()
        this.makeVarTemplete()
        this.makeInputModel()
    }
    makeVarTemplete() {
        let valInfo = document.querySelectorAll("[e-data]")
        this.valReplace(valInfo)
    }
    readSkeleton(tag ="*") {
        let skeleton = document.getElementsByTagName(tag)
        return skeleton
    }
    valReplace(valInfo) {
        for (const dom of valInfo) {
            let valName = dom.getAttribute("e-data")
            let realValName = valName.split('.')[0]
            realValName = realValName.split('[')[0]
            dom.innerText = eval(`this._data.${valName}`)
            this.pushValChangeCallBack(realValName, {dom, js: `this._data.${valName}`} ,(data, newVal)=>{
                try {
                    data.dom.innerText = eval(data.js)
                } catch (error) {
                    data.dom.innerText = ''
                }
            })
        }
    }
    makeInputModel() {
        let inputInfo = this.readSkeleton('input')
        this.InputModel(inputInfo)
    }
    InputModel(inputInfo) {
        for (const dom of inputInfo) {
            let valName = dom.getAttribute("val")
            dom.value = this._data[valName]
            // 修改操作压入栈
            this.pushValChangeCallBack(valName, dom ,(dom, newVal)=>{
                dom.value = newVal
            })
            // 内容改变修改变量
            dom.oninput = () => {
                this.data[valName] = dom.value
            }
        }
    }
    createVar() {
        let vals = this.getVarValues()
        for (const item of vals) {
            this.makeOneVal(item.name, item.value)
        }
    }
    pushValChangeCallBack(valName, data, ev) {
        if(this.modelValChangeCallBack[valName] == null) this.modelValChangeCallBack[valName] = []
        this.modelValChangeCallBack[valName].push({ev, data})
    }
    makeOneVal(key, value) {
        try {
            this._data[key] = (new Function("return " + value))()
        } catch (error) {
            this._data[key] = value
        }
        let that = this
        Object.defineProperty(this.data, key, {
            get() {
                return that._data[key]
            },
            set(newValue) {
                that._data[key] = newValue
                console.info("EasyFront[INFO]: 检测到数据变化。")
                if(that.modelValChangeCallBack[key] == null) that.modelValChangeCallBack[key] = []
                that.modelValChangeCallBack[key].forEach(element => {
                    console.info("EasyFront[INFO]: 更新节点:" + element.data)
                    element.ev(element.data, newValue)
                });
            }
        })
    }
    getVarValues() {
        let skeleton = this.readSkeleton('var')
        let values = []
        for (const item of skeleton) {
            let name = item.getAttribute('name')
            let value = item.getAttribute('value')
            values.push({name, value})
        }
        return values
    }

    
}

export default ValEngine