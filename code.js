var Code = function () {
  var funcs = {};

  this.execfuncs = function(){
    for (var key in funcs) {
      console.log("executing " + key);
      var do_again = false;
      try{
        do_again = funcs[key]();
      }
      catch(e){
        console.log("execfuncs error. deleting this function: " + e);
      }
      if (do_again === false){
        this.delfunc(key);
      }
    }
  }

  this.addfunc_by_str = function(str){
    try{
      eval(str);
      this.addfunc(func);
    }
    catch(e){
      console.log("addfunc_by_str error: " + e);
    }
  }

  this.addfunc = function(f){
    try{
      funcs[f.name] = f;
    }
    catch(e){
      console.log("addfunc error: " + e);
    }
  }

  this.delfunc = function(f_name){
    try{
      delete funcs[f_name];
    }
    catch(e){
      console.log("dellfunc error: " + e);
    }
  }

  this.listcode = function(){
    for (var key in funcs) {
      console.log(key);
    }
  }
}

module.exports = Code;

// test

// var m = "code:\nvar a = 1;<eof>".match(/^code:([\s\S]*)<eof>/);
// console.log(m[0]);
// console.log(m[1]);

// 
// var f1 = function func1(){
//   console.log("hello");
//   return true;
// }
//
// var f2 = function func2(){
//   console.log("world");
//   return false;
// }
//
// var str = 'var func = function func3(){console.log("eval");return false;}';
// var str2 = 'var func = function func4(){console.log("eval2");return truse;}';
//
// var c = new Code();
// c.addfunc(f1);
// c.addfunc(f2);
// c.addfunc_by_str(str);
// c.addfunc_by_str(str2);
// c.listcode();
// console.log("[frist trial]");
// c.execfuncs();
// c.listcode();
// console.log("[second trial]");
// c.execfuncs();
