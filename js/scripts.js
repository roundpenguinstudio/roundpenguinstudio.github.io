
var menu_show = document.getElementById("menu-show");
var burger_menu = document.getElementById("burger-menu");
menu_show.style.display = "none";  
function toggleMenu(x){
    burger_menu.classList.toggle("change");
  if(menu_show.style.display=="none"){
    menu_show.style.display = "block";  
  }else{
    menu_show.style.display = "none";
  }
  
}

window.onscroll = function(){
if(window.scrollY>10){
document.getElementById("top-nav-container1").style = 
"background:rgb(216, 218, 209,1);-webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) ;-moz-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) ;box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) ;";
document.getElementById("top-nav-container2").style = 
"background:rgb(216, 218, 209,1);-webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) ;-moz-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) ;box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) ;";
}else{
document.getElementById("top-nav-container1").style = "";
document.getElementById("top-nav-container2").style = "";
}
};