class EasyFront {
    constructor() {
        this.EFTempleteEngine = new EFTempleteEngine()
        console.log("EasyFront[INFO]: EFTempleteEngine Ready")
    }
}

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
        document.body.innerHTML = `<div id="mask" style="position: fixed; width: 100%; height: 100%; background-color: white; top: 0px; left: 0px; transition: all 0.5s ease 0s;"></div>` + finalhtml
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
EasyFront = new EasyFront()