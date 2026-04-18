Java.perform(function (){  //固定
    // ('包名.类名').方法名.getSmscode.implementation=function(){} hook函数格式
    Java.use('com.jx885.library.http.CommAction').getSmscode.implementation=function (mi,mstr,mstr2){
        console.log(mi,mstr,mstr2);
        return this.getSmscode(mi,mstr,mstr2); //注意hook完一定要返回函数，否则可能会报错
    }
});