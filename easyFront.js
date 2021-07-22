class EasyFront {
    constructor() {
        this.EFTempleteEngine = new EFTempleteEngine()
    }
}


/**
 * 名称 模板引擎
 * 功能 渲染 block模板 并把内容进行替换
 * @date 2021-07-21
 * @returns {any}
 */
class EFTempleteEngine {
    constructor() {
        this.laodMask()
        this.makeChildHtml()
    }
    laodMask(bool = true) {
        let div = document.createElement("div")
        if(bool) {
            div.style.position = 'fixed'
            div.style.width = "100%"
            div.style.height = "100%"
            div.style.backgroundColor = 'white'
            div.style.top = '0'
            div.style.left = '0'
            div.style.transition = 'all 0.5s'
            document.body.appendChild(div)
        }else{
            setTimeout(() => {
                let div = document.getElementById("mask")
                div.style.opacity = 0
                div.style.visibility = 'hidden'
                console.info("EasyFront[INFO]: EFTempleteEngine Ready。")
                EasyFront.ValEngine = new ValEngine()
            }, 400)
        }
    }
    readSkeleton(tag ="*") {
        let skeleton = document.getElementsByTagName(tag)
        return skeleton
    }
    async makeChildHtml() {
        // 分析是否需要继承
        let text = document.body.innerText
        // 不需要则终止
        if(text == null) {
            EasyFront.EFTempleteEngine.laodMask(false)
            return
        }
        
        // 获取继承信息
        let htmlTempleteInfo = this.Matcher(text)
        if(htmlTempleteInfo == undefined) {
            EasyFront.EFTempleteEngine.laodMask(false)
            return
        }
        htmlTempleteInfo = htmlTempleteInfo.filter((e)=>{ return e.type == 'extends' })
        if(htmlTempleteInfo.length < 1 ) {
            EasyFront.EFTempleteEngine.laodMask(false)
            return
        }
        // 获取孩子页面的继承值
        let values = this.getChildTempleteValues()
        // 获取父亲的html内容
        let fatherHtml = await new httpUtils().EFajax(htmlTempleteInfo[0].value)
        // 分析填写区域
        let htmlTempletePre = this.Matcher(fatherHtml)
        let finalhtml = this.Htmlreplace(values, htmlTempletePre, fatherHtml)
        document.body.innerHTML = `<div id="mask" style="z-index:99999;position: fixed; width: 100%; height: 100%; background-color: white; top: 0px; left: 0px; transition: all 0.5s ease 0s;"></div>` + finalhtml
        this.makeChildHtml()
    }
    getChildTempleteValues() {
        let skeleton = this.readSkeleton('block')
        let values = {}
        for (const item of skeleton) {
            let key = item.getAttribute('ref')
            let data ={}
            values[key] = item.innerHTML
        }
        return values
    }
    Matcher(text) {
        let reg = new RegExp(/(?<={{).*?(?=}})/g)
        let arr = text.match(reg)
        if (arr == null) return
        let htmlTempleteInfo = []
        for (const item of arr) {
            let itemTemp = item.trim()
            let itemInfo = itemTemp.split(" ")
            htmlTempleteInfo.push({type: itemInfo[0], value: itemInfo[1], pattern: `{{${item}}}`})
        }
        return htmlTempleteInfo
    }
    Htmlreplace(values, htmlTempletePre, htmlTemplete) {
        for (const item of htmlTempletePre) {
            let reg = new RegExp(item.pattern)
            if(item.type == 'block') {
                htmlTemplete = htmlTemplete.replace(reg, values[item.value])
            }
        }
        return htmlTemplete
    }


}
/**
 * 名称 请求工具箱
 * 功能 获取页面内容
 * @date 2021-07-21
 * @returns {any}
 */
class httpUtils {
    EFajax(url, method = "GET", data = null) {
        let pro = new Promise(function(resolve, reject) {
            let ajax = new XMLHttpRequest()
            ajax.open(method, url)
            ajax.send(data)
            ajax.onreadystatechange = () => {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    resolve(ajax.responseText)
                }
            }
            setTimeout(() => {
                reject("EasyFront[ERROR]: 请求服务器失败。")
            }, 1000)
        })
        return pro
    }
}

class ValEngine {
    constructor() {
        this._data = {}
        this.data = {}
        this.modelValChangeCallBack = {}
        this.createVar()
        this.makeVarTemplete()
        this.makeInputModel()
        this.makeForTemplete()
        EasyFront.httpEngine = new httpEngine()
    }
    makeVarTemplete() {
        let valInfo = document.querySelectorAll("[e-data]")
        this.valReplace(valInfo)
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
    makeForTemplete() {
        let forInfo = document.querySelectorAll("[e-for]")
        this.ForTempleteReplace(forInfo)
    }
    ForTempleteReplace(forInfo) {
        console.log(forInfo)
        for (const dom of forInfo) {
            let valName = dom.getAttribute("e-for")
            let child = dom.children[0]
            let index = 0
            for (const item of this._data[valName]) {
                item.index = index++
                let new_child = child.cloneNode(true)
                let vals = new_child.querySelectorAll("[e-for-data]")
                for (const dom of vals) {
                    let valName = dom.getAttribute("e-for-data")
                    dom.innerText = eval(`${valName}`)
                }
                dom.appendChild(new_child)
            }
            dom.removeChild(child)
            this.pushValChangeCallBack(valName, child ,(child, newVal)=>{
                dom.innerHTML = ""
                let index = 0
                for (const item of this._data[valName]) {
                    item.index = index++
                    let new_child = child.cloneNode(true)
                    let vals = new_child.querySelectorAll("[e-for-data]")
                    for (const dom of vals) {
                        let valName = dom.getAttribute("e-for-data")
                        dom.innerText = eval(`${valName}`)
                    }
                    dom.appendChild(new_child)
                }
            })
        }
    }
    makeInputModel() {
        let inputInfo = EasyFront.EFTempleteEngine.readSkeleton('input')
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
        Object.defineProperty(this.data, key, {
            get() {
                return EasyFront.ValEngine._data[key]
            },
            set(newValue) {
                EasyFront.ValEngine._data[key] = newValue
                console.info("EasyFront[INFO]: 检测到数据变化。")
                if(EasyFront.ValEngine.modelValChangeCallBack[key] == null) EasyFront.ValEngine.modelValChangeCallBack[key] = []
                EasyFront.ValEngine.modelValChangeCallBack[key].forEach(element => {
                    console.info("EasyFront[INFO]: 更新节点:" + element.data)
                    element.ev(element.data, newValue)
                });
            }
        })
    }
    getVarValues() {
        let skeleton = EasyFront.EFTempleteEngine.readSkeleton('var')
        let values = []
        for (const item of skeleton) {
            let name = item.getAttribute('name')
            let value = item.getAttribute('value')
            let ref = item.getAttribute('ref')
            values.push({name, value})
        }
        return values
    }

    
}
class httpEngine {
    constructor() {
        this.makeRequest()
    }
    async makeRequest() {
        let reqs = EasyFront.EFTempleteEngine.readSkeleton('request')
        for (const req of reqs) {
            console.log(req)
            let url = req.getAttribute("e-url")
            let method = req.getAttribute("e-method")
            let data = req.getAttribute("e-req-data")
            let model = req.getAttribute("e-model")
            let callback = req.getAttribute("e-callback")
            if(method == "GET" || method == "get") {
                url = url + data
            }
            let res = await new httpUtils().EFajax(url, method, data)
            res = JSON.parse(res)
            let cb = new Function('res', "return " + callback)
            let cbRes =cb(res)
            EasyFront.ValEngine.data[model] = cbRes
        }
    }
}

EasyFront = new EasyFront()