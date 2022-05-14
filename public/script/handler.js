/* const samp = document.getElementById('samp');

samp.style.color="red";
/* newsfeed.addEventListener("click",function(){

}) */ 


console.log("handler working")



document.getElementById('newsfeed').onclick = abc1;

function abc1(){
   /*  document.getElementById('newsfeed').style.background = "#839db57c";
    document.getElementById('newsfeed').style.transition = ".3s ease";
 */
    document.getElementById('newsfeed').classList.add("point");
    document.getElementById('dep-prf').classList.remove("point");
    document.getElementById('stud-prf').classList.remove("point");


   /*  document.querySelector(".main-1").classList.remove("visi");
    document.querySelector(".main-2").classList.add("visi");
    document.querySelector(".main-3").classList.add("visi"); */
}

document.getElementById('dep-prf').onclick = abc2;

function abc2(){
    document.getElementById('dep-prf').classList.add("point");
    document.getElementById('newsfeed').classList.remove("point");
    document.getElementById('stud-prf').classList.remove("point");

   /*  document.querySelector(".main-2").classList.remove("visi");
    document.querySelector(".main-1").classList.add("visi");
    document.querySelector(".main-3").classList.add("visi"); */
}

document.getElementById('stud-prf').onclick = abc3;

function abc3(){
    document.getElementById('stud-prf').classList.add("point");
    document.getElementById('dep-prf').classList.remove("point");
    document.getElementById('newsfeed').classList.remove("point");

   /*  document.querySelector(".main-3").classList.remove("visi");
    document.querySelector(".main-1").classList.add("visi");
    document.querySelector(".main-2").classList.add("visi"); */
}


/*********************Student profile**************************************** */




document.getElementById("appr").onclick = disp1;

function disp1(){
document.getElementById("appr").classList.add("point-2");
document.getElementById("pend").classList.remove("point-2");


document.querySelector(".feed-wrapper-pending").classList.add("visi");
document.querySelector(".feed-wrapper-approve").classList.remove("visi");





}

document.getElementById("pend").onclick = disp2;

function disp2(){
document.getElementById("pend").classList.add("point-2");
document.getElementById("appr").classList.remove("point-2");

document.querySelector(".feed-wrapper-approve").classList.add("visi");
document.querySelector(".feed-wrapper-pending").classList.remove("visi");



}


/*******************NOTIFICATION************************* */

var notfi  = document.getElementById("notify");
var x = 0 ;

notfi.onclick = notfy ;

function  notfy()
{
    if(x==0)
    {
        document.getElementById("notify").classList.add("point");
        document.querySelector(".notify-wrapper").classList.remove("visi");
        x=1;
    }else{
        document.getElementById("notify").classList.remove("point");

        document.querySelector(".notify-wrapper").classList.add("visi");
        x=0;
    }
}



/************************DEPARTMENT PROFILE ************************* */

/* document.getElementById("my-dep").onclick = depPrfShow;

function depPrfShow()
{

}
 */

