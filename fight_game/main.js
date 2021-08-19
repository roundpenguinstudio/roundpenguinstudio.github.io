const k = kaboom({
    width: 400, // width of canvas
    height: 1000, // height of canvas
    canvas: document.getElementById("game"), // use custom canvas
    scale: 2, // pixel size (for pixelated games you might want smaller size with scale)
    clearColor: [0, 0, 0, 1], // background color (default is a checker board background)
    fullscreen: false, // if fullscreen
    crisp:true, // if pixel crisp (for sharp pixelated games)
    debug: true, // debug mode
    
});

function reportWindowSize() {
  if(window.innerHeight < window.innerWidth){
      document.getElementById('game').style.width = window.innerWidth;
      document.getElementById('game').style.height = window.innerHeight*0.8;
}else{
    document.getElementById('game').style.width = window.innerWidth;
    document.getElementById('game').style.height = window.innerWidth*0.5;
  }
}
reportWindowSize();
window.onresize = reportWindowSize;
var global_scaleX = 1;
var global_scaleY = 1;
var fat_wins = 0;
var penguin_wins = 0;
var direction_offset = {"u":0,"d":150,"m":25};
var fat;
var penguin;

k.loadRoot("/fighting_assets/");
k.loadSprite("bg", "background.png");
k.loadSprite("f-idle-1", "f-idle-1.png");
k.loadSprite("f-idle-2", "f-idle-2.png");
k.loadSprite("f-att-d", "f-att-d.png");
k.loadSprite("f-att-m", "f-att-m.png");
k.loadSprite("f-att-u", "f-att-u.png");
k.loadSprite("f-def-d", "f-def-d.png");
k.loadSprite("f-def-m", "f-def-m.png");
k.loadSprite("f-def-u", "f-def-u.png");
k.loadSprite("f-x", "f-x.png");
k.loadSprite("p-idle-1", "p-idle-1.png");
k.loadSprite("p-idle-2", "p-idle-2.png");
k.loadSprite("p-att-d", "p-att-d.png");
k.loadSprite("p-att-m", "p-att-m.png");
k.loadSprite("p-att-u", "p-att-u.png");
k.loadSprite("p-def-d", "p-def-d.png");
k.loadSprite("p-def-m", "p-def-m.png");
k.loadSprite("p-def-u", "p-def-u.png");
k.loadSprite("arrow-u", "arrow-u.png");
k.loadSprite("arrow-l", "arrow-l.png");
k.loadSprite("arrow-r", "arrow-r.png");
k.loadSprite("arrow-d", "arrow-d.png");
k.loadSprite("p-x", "p-x.png");
k.loadSprite("spark", "spark.png");

k.loadSound("blocked_d", "blocked_d.wav");
k.loadSound("blocked_m", "blocked_m.wav");
k.loadSound("blocked_u", "blocked_u.wav");
k.loadSound("hit", "hit1.wav");
k.loadSound("p_hit1", "p_hit1.wav");
k.loadSound("p_hit2", "p_hit2.wav");
k.loadSound("p_hit3", "p_hit3.wav");
k.loadSound("f_hit1", "f_hit1.wav");
k.loadSound("f_hit2", "f_hit2.wav");
k.loadSound("f_hit3", "f_hit3.wav");

k.loadSound("sword_down1", "sword_down1.wav");
k.loadSound("sword_down2", "sword_down2.wav");
k.loadSound("sword_down3", "sword_down3.wav");

var audio_cooldown = {
    "sword_down":0,"p_hit":0,
    "f_hit":0,"blocked_d":0,"blocked_m":0,"blocked_u":0,"hit":0
}
function restart(){
    fat = {"x":250,"mode":"idle-1","stamina":0,"health":1,"direction":"m","attacking":false,"defending":false,"speed":6}
    penguin = {"x":50,"mode":"idle-1","stamina":0,"health":1,"direction":"m","attacking":false,"defending":false,"speed":6}
}
restart();

k.scene("main", () => {
k.keyPress("space", () => {
});
k.keyPress("left", () => {
    if(fat["mode"]=="idle-1"){
        fat["mode"] = "idle-2";
    }else if(fat["mode"]=="idle-2"){
        fat["mode"] = "idle-1";
    }
    fat["direction"] = "m";
    if(fat["x"] - penguin["x"]>48){
        fat["x"] -= fat["speed"];
    }
    
});
k.keyPress("right", () => {
    if(fat["mode"]=="idle-1"){
        fat["mode"] = "idle-2";
    }else if(fat["mode"]=="idle-2"){
        fat["mode"] = "idle-1";
    }
    fat["x"] += fat["speed"];

});
k.keyPress("down", () => {
    fat["direction"] = "d";
});
k.keyPress("up", () => {
    fat["direction"] = "u";
});
k.keyPress(",", () => {    
    if(fat["stamina"]>=1){
        k.play("sword_down"+(Math.floor(Math.random()*3)+1).toString(), {
            volume: 1.0,
            speed: 0.8,
        });
        fat["stamina"] -= 1;
        fat["attacking"] = true;
        fat["defending"] = false;
        fat["mode"] = "att-" + fat["direction"];
    }
});
k.keyPress(".", () => {    
    if(fat["defending"]==true){
        fat["defending"] = false; 
    }else{
        fat["defending"] = true; 
    }
    fat["attacking"] = false;
});

k.keyPress("a", () => {
    if(penguin["mode"]=="idle-1"){
        penguin["mode"] = "idle-2";
    }else if(penguin["mode"]=="idle-2"){
        penguin["mode"] = "idle-1";
    }
    penguin["x"] -= penguin["speed"];
});
k.keyPress("d", () => {
    if(penguin["mode"]=="idle-1"){
        penguin["mode"] = "idle-2";
    }else if(penguin["mode"]=="idle-2"){
        penguin["mode"] = "idle-1";
    }
    penguin["direction"] = "m";
    if(fat["x"] - penguin["x"]>48){
        penguin["x"] += penguin["speed"];
    }
});
k.keyPress("s", () => {
    penguin["direction"] = "d";
});
k.keyPress("w", () => {
    penguin["direction"] = "u";
});
k.keyPress("2", () => {        
    if(penguin["stamina"]>=1){
        k.play("sword_down"+(Math.floor(Math.random()*3)+1).toString(), {
            volume: 1.0,
            speed: 0.8,
        });
        penguin["stamina"] -= 1;
        penguin["attacking"] = true;
        penguin["defending"] = false;
        penguin["mode"] = "att-" + penguin["direction"];
    }
});
k.keyPress("1", () => {    
    if(penguin["defending"]==true){
        penguin["defending"] = false; 
    }else{
        penguin["defending"] = true; 
    }
    penguin["attacking"] = false;
});



k.layers([
		"bg",
		"obj",
		"ui",
], "obj");

k.add([
    k.sprite("bg"),
    k.pos(0,0),
    k.scale([global_scaleX,global_scaleY]),
    k.layer("obj"),
    "leaf"]);

function play_audio(aud,aud_identifier){
    if(audio_cooldown[aud_identifier]<=0){
        k.play(aud, {
            volume: 1.0,
            speed: 1,
        });
        audio_cooldown[aud_identifier] = 20;
    }
}
function draw_bar(amount,locationX,locationY,color){    
    k.drawRect(k.vec2(locationX,locationY), 
    amount * 120, 50,
    {
        color: color,
    });
    k.drawRect(k.vec2(locationX,locationY), 
    120, 3,
    {
        color: k.rgb(0,0,0),
    });
    k.drawRect(k.vec2(locationX,locationY), 
    1, 50,
    {
        color: k.rgb(0,0,0),
    });
    k.drawRect(k.vec2(locationX+119,locationY), 
    1, 50,
    {
        color: k.rgb(0,0,0),
    });
    k.drawRect(k.vec2(locationX,locationY + 50-3), 
    120, 3,
    {
        color: k.rgb(0,0,0),
    });
}

k.render(()=>{    
    for (var aud in audio_cooldown){
        audio_cooldown[aud] = Math.max(0,audio_cooldown[aud]-1);
    }
    if(fat["stamina"]<=1){        
        fat["stamina"] +=0.01;
    }
    if(fat["stamina"]>=0.3){
        if(fat["attacking"]==true){
            fat["attacking"] = false;
            fat["mode"] = "idle-1";
        }
    }

    if(penguin["stamina"]<=1){        
        penguin["stamina"] +=0.01;
    }
    if(penguin["stamina"]>=0.3){
        if(penguin["attacking"]==true){
            penguin["attacking"] = false;
            penguin["mode"] = "idle-1";
        }
    }
            
    fat["stamina"]= Math.min(fat["stamina"],1)
    penguin["stamina"]= Math.min(penguin["stamina"],1)
    draw_bar(fat["stamina"],250,80,k.rgb(1+(1-fat["stamina"]), 0.8*fat["stamina"], 0));
    draw_bar(penguin["stamina"],20,80,k.rgb(1+(1-penguin["stamina"]),0.8*penguin["stamina"], 0));

    draw_bar(Math.min(fat["health"],1),250,20,k.rgb(0.2, 0.8, 0));
    draw_bar(Math.min(penguin["health"],1),20,20,k.rgb(0.2, 0.8, 0));

    /*
    ==================
    */
    k.drawSprite("f-"+fat["mode"], {
        pos: k.vec2(fat["x"],365),
        scale: [global_scaleX*0.2,global_scaleY*0.8],
        frame: 0,
    });
    if(penguin["attacking"]==true){
        if(fat["x"] - penguin["x"] < 52){
            if(fat["defending"]==true && fat["direction"]==penguin["direction"]){
                    k.drawSprite("spark", {
                    pos: k.vec2(fat["x"]+20,373+direction_offset[fat["direction"]]),
                    scale: [global_scaleX*0.2,global_scaleY*0.8],
                    frame: 0,
                    });
                    play_audio("blocked_"+fat["direction"],"blocked_"+fat["direction"])
            }else{
                k.drawSprite("f-x", {
                    pos: k.vec2(fat["x"],373),
                    scale: [global_scaleX*0.2,global_scaleY*0.8],
                    frame: 0,
                });
                fat["health"]  = Math.max(fat["health"]-0.005,0);
                play_audio("f_hit"+(Math.floor(Math.random()*3)+1).toString(),"f_hit")
                play_audio("hit","hit")
            }
            
        }
    }else if(penguin["defending"]==true){
        penguin["speed"] = 3;
        if(penguin["stamina"]>0.05){
            //penguin["stamina"] = Math.max(penguin["stamina"]-0.025,0);
            penguin["mode"] = "def-" + penguin["direction"];
        }else{
            penguin["defending"] = false;
        }
    }else{
        penguin["speed"] = 6;
        if(penguin["mode"]!="idle-1" && penguin["mode"]!="idle-2"){
            penguin["mode"] = "idle-1";
        }
    }

    /*
    ==================
    */
    
    k.drawSprite("p-"+penguin["mode"], {
        pos: k.vec2(penguin["x"],373),
        scale: [global_scaleX*0.2,global_scaleY*0.8],
        frame: 0,
    });
    if(fat["attacking"]==true){
        if(fat["x"] - penguin["x"] < 52){
            if(penguin["defending"]==true && penguin["direction"]==fat["direction"]){
                    k.drawSprite("spark", {
                    pos: k.vec2(penguin["x"]+60,373+direction_offset[penguin["direction"]]),
                    scale: [global_scaleX*0.2,global_scaleY*0.8],
                    frame: 0,
                });
                play_audio("blocked_"+penguin["direction"],"blocked_"+penguin["direction"]);
            }else{
                k.drawSprite("p-x", {
                    pos: k.vec2(penguin["x"],373),
                    scale: [global_scaleX*0.2,global_scaleY*0.8],
                    frame: 0,
                });
                penguin["health"]  = Math.max(penguin["health"]-0.005,0);
                play_audio("p_hit"+(Math.floor(Math.random()*3)+1).toString(),"p_hit");
                play_audio("hit","hi");
            }
        }
    }else if(fat["defending"]==true){
        fat["speed"] = 3;
        if(fat["stamina"]>0.05){
            //fat["stamina"] = Math.max(fat["stamina"]-0.025,0);
            fat["mode"] = "def-" + fat["direction"];
        }else{
            fat["defending"] = false;
        }
    }else{
        fat["speed"] = 6;
        if(fat["mode"]!="idle-1" && fat["mode"]!="idle-2"){
            fat["mode"] = "idle-1";
        }        
    }
    if(fat["health"]==0 && penguin["health"]==0){
        alert("draw");
        restart();        
    }else if(fat["health"]==0){
        alert("penguin wins");
        penguin_wins +=1;
        restart();
    }else if(penguin["health"]==0){
        alert("fat wins");
        fat_wins +=1;
        restart();
    }
    k.drawText(        
        pad_vals(penguin_wins,true) +
        ":" +
        pad_vals(fat_wins,false)
        , {
        size: 20,
        pos: k.vec2(125,50),
        scale:k.vec2(1,3),
        origin: "topleft",
        color:k.rgb(0,0,0)
    });
    
    if(fat["direction"]=="m"){
        k.drawSprite("arrow-l", {
            pos: k.vec2(fat["x"]+55,330),
            scale: [global_scaleX*0.2,global_scaleY*0.8],
            frame: 0,
        });
    }else{
        k.drawSprite("arrow-"+fat["direction"], {
            pos: k.vec2(fat["x"]+55,330),
            scale: [global_scaleX*0.2,global_scaleY*0.8],
            frame: 0,
        });
    }
    if(penguin["direction"]=="m"){
        k.drawSprite("arrow-r", {
            pos: k.vec2(penguin["x"]+30,420),
            scale: [global_scaleX*0.2,global_scaleY*0.8],
            frame: 0,
        });
    }else{
        k.drawSprite("arrow-"+penguin["direction"], {
            pos: k.vec2(penguin["x"]+30,420),
            scale: [global_scaleX*0.2,global_scaleY*0.8],
            frame: 0,
        });
    }
});

});

function pad_vals(val,left){
    val = val.toString()
    while(val.length<3){
        if(left==true){
            val = " " + val;
        }else{
            val =  val+ " ";
        }
    }
    return val;
}

k.go('main');
