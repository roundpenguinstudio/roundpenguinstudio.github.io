const k = kaboom({
    width: 400, // width of canvas
    height: 500, // height of canvas
    canvas: document.getElementById("game"), // use custom canvas
    scale: 2, // pixel size (for pixelated games you might want smaller size with scale)
    clearColor: [0, 0, 0, 1], // background color (default is a checker board background)
    fullscreen: false, // if fullscreen
    crisp: true, // if pixel crisp (for sharp pixelated games)
    debug: false, // debug mode
});
function reportWindowSize() {
  if(window.innerHeight > window.innerWidth){
      document.getElementById('game').style.width = window.innerWidth;
      document.getElementById('game').style.height = window.innerWidth;
}else{
    document.getElementById('game').style.width = window.innerHeight;
      document.getElementById('game').style.height = window.innerHeight;
  }
}
reportWindowSize();

var soil_num = 16;
var root_width = 20;
var soil_width = k.width();
var speedY = 100;
var total_root_num = 0;
var started = false;
var score = 0;
var roots = {};
var root_type_num = 7;
var branch_thresh = 30;
var branch_life = 20;
var global_scale = 0.5;
var pixelScale = 2;

var best_scores = localStorage.getItem('best_scores');
if(!best_scores){
    best_scores = [];
}
if(typeof(best_scores)!=typeof([])){
    best_scores = [];
    localStorage.setItem("best_scores",[]);
}


window.onresize = reportWindowSize;
k.loadRoot("/soilparts/");
for(var i=0;i<soil_num;i++){
    k.loadSprite("soil"+i.toString(), i.toString()+".png");
}
k.loadSprite("start","start.png");
k.loadSprite("leaf","leaftop.png");
for(var i=0;i<root_type_num;i++){
    k.loadSprite("root"+i.toString(),"root"+i.toString()+".png");
}

k.loadSprite("knob","grass.png");
k.loadSprite("root_head","roothead.PNG");
k.loadSprite("rock1","rock1.png");
k.loadSprite("rock2","rock2.png");
k.loadSprite("mush1","mush1.png");
k.loadSprite("nav","nav.png");
k.loadSprite("beetle","beetle.png");
var moved_amount = 0;
/////////////////////////////////////////////
/////////////////////////////////////////////

k.scene("main", () => {
var curDraggin = null;
k.mouseDown(()=>{
    let mouseX = (k.mousePos().x*pixelScale/parseFloat(document.getElementById('game').style.width))*k.width();
    let mouseY = (k.mousePos().y*pixelScale/parseFloat(document.getElementById('game').style.height))*k.height();    
    k.every("knob",(knob)=>{
        if((Math.abs(knob.pos.x-mouseX)+Math.abs(knob.pos.y-mouseY))<100){
            curDraggin = knob;
  
        }
    });
    k.every('start_button',(sb)=>{
        if((Math.abs(sb.pos.x-mouseX)<100)
        && (Math.abs(sb.pos.y-mouseY)<50)){
            restart();
            k.destroy(sb);
        }
    });
    k.every('nav',(b)=>{
        if((Math.abs(b.pos.x-mouseX)<100)
        && (Math.abs(b.pos.y-mouseY)<50)){
            showNavMenu();
            k.destroy(b);
        }
    });
    k.every('close-nav',(b)=>{
        if((Math.abs(b.pos.x-mouseX)<100)
        && (Math.abs(b.pos.y-mouseY)<50)){
            closeNavMenu();
            k.destroy(b);
        }
    });

})
k.keyPress("space", () => {
    started = !started;
});
k.keyPress("a", () => {
    roots["root1"] -=10;
});
k.keyPress("d", () => {
    roots["root1"] +=10;
});
k.keyPress("s", () => {
    speedY +=10;
});

k.mouseRelease(()=>{
    curDraggin =null;
});
/////////////////////////////////////////////
/////////////////////////////////////////////

k.layers([
		"bg",
		"obj",
		"ui",
], "obj");




/////////////////////////////////////////////
//ADD BG
function restart(){
    score = 0;
    roots = {};
    speedY = 50;
    started = true;
    k.every("nav",(nav)=>{
        k.destroy(nav);
    })
    k.add([
            k.sprite("leaf"),
            k.pos(0,0),
            k.scale(global_scale),
            k.layer("bg"),
            "leaf"
    ]);    
    k.every("root",(root)=>{
        k.destroy(root);
    });
    k.every("obstruction",(obstruction)=>{
        k.destroy(obstruction);
    });
    k.every("root_head",(root_head)=>{
        k.destroy(root_head);
    });
    addNewRoot("root1",k.width()*0.5,k.height()*0.37);
    addRandomObstruction();
}
k.add([
            k.sprite("leaf"),
            k.pos(0,0),
            k.scale(global_scale),
            k.layer("bg"),
            "leaf"
    ]);
 const start_button =  k.add([
            k.sprite("start"),
            k.pos(k.height()*0.4,k.height()*0.5),
            k.layer("ui"),
            k.scale(global_scale),
            k.origin("center"),
            "start_button"
    ]);

/////////////////////////////////////////////
k.add([
    k.sprite("nav"),
    k.pos(0,0),
    k.layer("ui"),
    k.scale(0.5*global_scale),
    "nav"
]);



function showNavMenu(){        
    k.go('scores');
    k.add([
        k.rect(k.height()*0.5, k.height()*0.5),
        k.color(k.rgba(0,0,0,0.8)),
        k.scale(global_scale),
        "nav-item"
    ]);
    k.add([
        k.text("nav1", 32),        
        k.pos(80, 80),
        k.layer("ui"),
        "nav-item"
    ]);
    k.every("start_button",(sb)=>{
        k.destroy(sb);    
    });    
    
}
function closeNavMenu(){
    k.go("main");
    return;/*
    k.every("nav-item",(nav_item)=>{
        k.destroy(nav_item);
    })
    k.add([
        k.sprite("start"),
        k.pos(k.height()*0.4,500),
        k.layer("ui"),
        k.origin("center"),
        "start_button"
    ]);
    k.add([
        k.sprite("nav"),
        k.pos(0,0),
        k.layer("ui"),
        k.scale(0.5),
        "nav"
    ]);*/
}


function addRandomSoil(x,y){
k.add([
		k.sprite("soil"+Math.floor(Math.random()*soil_num).toString()),
        k.pos(x,y),
        k.scale(k.width()/100),
        //k.scale(global_scale),
		k.layer("bg"),
        "soil",
            {
        generated:false
    }]);
}

/////////////////////////////////////////////



for(var i=0;i<=(k.width()/soil_width)+1;i++){
for(var j=1;j<=((k.height())/soil_width)+2;j++){
    addRandomSoil(i*soil_width,j*soil_width+k.height()*0.4-soil_width);
}
}

function addNewRoot(root_id_param,initial_root,target_root){
    total_root_num +=1;
    roots[root_id_param] = target_root;
    k.add([
    k.sprite("root_head"),
    k.pos(initial_root,k.height()*0.4),
    k.scale(global_scale),
    k.layer("obj"),
    k.rotate(0),
    k.origin("top"),
    "root_head",    
    root_id_param,
        {
            root_id:root_id_param,
            root_head:true,
            stopped:false,
            prevX:initial_root,
            last_gen:0,
            last_branch:0,
            branch_direction:1,
        }
    ]);
    k.add([
        k.sprite("knob"),
		k.pos(roots[root_id_param],k.height()-50),
		k.scale(global_scale),
        k.layer("ui"),
        k.solid(),
		k.origin("center"),
        "knob",
        {
            root_id:root_id_param
        }
	]);
}






var obstructions_types = [
    ///////////////////
    [["rock1",0,500,1],
    ["rock2",300,200,1],
    ["beetle",150,1000,0.5],
    ["rock2",200,800,1],
    ["rock2",600,600,1],
    ["rock2",250,500,1],
    ["rock1",500,1500,1]],
    ////////////////////
    [["beetle",800,500,0.5],
    ["rock2",100,300,1],
    ["rock2",50,700,1],
    ["rock2",0,500,1],
    ["rock2",250,700,1],
    ["rock2",350,500,1],
    ["rock2",800,700,1],
    ["beetle",500,1500,0.8]],
    ////////////////////
    [["rock1",0,1200,1],
    ["rock2",k.height()*0.4,800,1],
    ["rock1",800,1000,1],
    ["rock2",600,600,1],
    ["rock2",250,500,1],
    ["rock2",450,300,1],
    ["rock1",500,1500,1]],
    ////////////////////
    [["rock1",100,300,1],
    ["rock2",500,200,1],
    ["rock2",850,700,0.7],
    ["beetle",200,800,1],
    ["rock1",500,1500,1]],
];

function addRandomObstruction(){
    let obstruction_chosen = obstructions_types[Math.floor(Math.random()*obstructions_types.length)];
    for(var i=0;i<obstruction_chosen.length;i++){
        let chosen = obstruction_chosen[i];
        k.add([
            k.sprite(chosen[0]),
            k.pos(chosen[1]*global_scale,(k.height()+k.height()*0.3+chosen[2])*global_scale),
            k.origin("center"),
            k.layer("obj"),
            k.scale(chosen[3]*global_scale),
            k.solid(),
            "obstruction",
            {
                obs_type:"block",
                genObject:false
            }
        ]);
    }
    if(Math.random()<0.6){
        k.add([
            k.sprite("mush1"),
            k.pos(Math.random()*k.width(),k.height()+Math.random()+k.height()*0.6),
            k.origin("center"),
            k.layer("obj"),
            k.scale(global_scale),
            k.solid(),            
            "obstruction",
            {
                obs_type:"splitter",
            }
        ]);
    }

    
    k.add([
        k.sprite("rock1"),
        k.pos(-k.height()*0.5,k.height()+k.height()*0.5),
        k.origin("center"),
        k.scale(global_scale),
        k.layer("obj"),
        k.solid(),
        "obstruction",
        {
            obs_type:"block",
            genObject:true
        }
    ]);    
};




k.render(() => {
    if(!started){
        return;

    }
    score += Math.ceil(Math.floor(speedY/50)/10 * (total_root_num+1));
    speedY +=0.1;
    k.drawText(score.toString(), {
        size: 64,
        pos: k.vec2(10,10),
        origin: "topleft",
        color:k.rgba(total_root_num*0.2,0.5,0.5)
    });
    if(!k.mouseIsDown()){
    curDraggin = null;
    }
    if(curDraggin){
        let mouseX = (k.mousePos().x*pixelScale/parseFloat(document.getElementById('game').style.width))*k.width();
        curDraggin.pos.x = mouseX;
        roots[curDraggin.root_id] = mouseX;
    }
/////////////////////////////////////////////

k.every("leaf",(leaf)=>{
    if(started==false){
        return;
    }
    leaf.move(k.vec2(0,-speedY));
    if(leaf.pos.y<=-k.height()*0.4){
        k.destroy(leaf);        
    }    
});

k.every("root",(root)=>{
    if(started==false){
        return;
    }
    if(root.root_head==false){
        root.move(k.vec2(0,-speedY));
    }
    /////////////////////////////////////////////
    //If is root generator
    if(root.root_generator==true){        
        if(root.gen_delay<=0){
        if(root.generated==false){
        root.generated = true;   
         if(root.stem_root==false){
    /////////////////////////////////////////////
if(root.root_scale>0.5 && root.root_num >branch_thresh*Math.pow(root.root_scale+0.05,3)){
    //root.generate_direction = -root.generate_direction;
    root.root_num =0;
    let hackyfix = 0;
    root.branch_direction = -root.generate_direction;
    if(root.generate_direction>0){

    }else{
        hackyfix = Math.PI;
    }
    

    k.add([
    k.sprite("root3"),
    k.pos(root.pos.x-root.generate_direction*Math.cos(root.generate_angle+Math.PI/2)*root_width*speedY/300,    
    root.pos.y+root.generate_direction*Math.sin(root.generate_angle+Math.PI/2)*root_width*speedY/300),
    k.origin("center"),
    k.layer("obj"),
    k.scale(Math.max(0.5,root.root_scale-0.1)*global_scale),
    k.rotate(root.generate_angle),
    "root",
    {
    generated: false,
    root_id:"root1",
    root_head:false,
    root_type:"root3",        
    root_generator: true,
    stem_root:false,
    generate_angle: root.generate_angle+Math.PI/2+hackyfix,
    start_angle:root.generate_angle+Math.PI/2+hackyfix,
    generate_direction: root.branch_direction,
    branch_direction:-root.branch_direction,
    gen_delay: (200/speedY),
    angle_mode:"down",
    root_scale: Math.max(0.3,root.root_scale-0.2),
    root_time:Math.random()*branch_life,
    root_num:0
    }]);    

    
    //0.67....
    //3.14
    //2.4
}
        /////////////////////////////////////////////
        }

        if(root.root_time!=0){
        if(root.generate_direction>0){
            //right
            root.generate_angle = Math.max(root.start_angle-Math.PI/2,root.generate_angle-0.05/root.root_scale);
        }else{
            //left
            root.generate_angle = Math.min(root.start_angle+Math.PI/2,root.generate_angle+0.05/root.root_scale);
        }
        

        let root_type = "root"+Math.floor(Math.random()*(root_type_num));
        k.add([
        k.sprite("root3"),
        k.pos(root.pos.x-root.generate_direction*Math.cos(root.generate_angle+Math.PI/2)*root_width*(Math.pow(root.root_scale,3))*speedY/500,        
        root.pos.y+root.generate_direction*Math.sin(root.generate_angle+Math.PI/2)*root_width*speedY/500),
        k.origin("center"),
        k.layer("obj"),
        k.scale(root.root_scale*global_scale),
        k.rotate(root.generate_angle),
        "root",
        {
        generated: false,
        root_id:"root1",
        root_head:false,
        root_type:root_type,
        root_generator: true,
        stem_root:false,
        generate_angle:root.generate_angle,
        start_angle:root.start_angle,
        generate_direction:root.generate_direction,
        gen_delay: (200/speedY),
        angle_mode:"down",
        root_time:root.root_time -1,
        root_scale:root.root_scale,
        branch_direction:root.branch_direction,
        root_num:root.root_num+1
        }]);
        }
        /////////////////////////////////////////////
       
        /////////////////////////////////////////////
        }
/////////////////////////////////////////////
        }else{
            root.gen_delay -=1;
        }
    
    }
    /////////////////////////////////////////////
    if(root.pos.y<=-root_width || root.pos.y>=k.height()+root_width){
        k.destroy(root);
    }
    if(root.pos.x>=(k.width()+root_width) ||(root.pos.x < -root_width) ){
        k.destroy(root);
    }
});

k.every("soil",(soil)=>{
    if(started==false){
        return;
    }
    soil.move(k.vec2(0,-speedY));            
    if(soil.pos.y<=0 && soil.generated==false){        
        soil.generated = true;
        addRandomSoil(soil.pos.x,k.height()-(0-soil.pos.y))        
    }
    if(soil.pos.y <=-soil_width){
        k.destroy(soil);
    }
});
k.every("obstruction",(rock)=>{    
    if(started==false){
        return;
    }
    rock.move(k.vec2(0,-speedY));
    if(rock.pos.y <=-k.height()*0.5){
        if(rock.genObject==true){
            addRandomObstruction();
        }
        k.destroy(rock);
    }
});

/////////////////////////////////////////////

k.every("root_head",(root)=>{
    if(!started){
        return;
    }
    if(root.stopped){
        root.move(k.vec2(0,-speedY));
        if(root.pos.y<-k.height()*0.1){
            k.destroy(root);
        }
    }
    if(Math.abs(root.pos.x-roots[root.root_id])>root_width){
        //root.velocityX = (knob.pos.x-root.pos.x/root.last_move)*0.2;
        //root.angle += (Math.PI/2)*((speedY*k.debug.fps())/(root.pos.x-roots[root.root_id]));
        let dx = (speedY * (Math.abs(root.pos.x-roots[root.root_id])/ (k.width()*0.5)))/k.debug.fps();
        let dy = speedY/k.debug.fps();
        if(root.pos.x-roots[root.root_id]>0){
            dx = -dx;
            root.move(k.vec2(-speedY * (Math.abs(root.pos.x-roots[root.root_id])/ (k.width()*0.5)),0));
        }else{
            root.move(k.vec2(speedY* (Math.abs(root.pos.x-roots[root.root_id])/ (k.width()*0.5)),0));
        }        
        root.angle = Math.tanh(dx/dy);
        
    }else{
        if(Math.abs(root.angle - 0)>0.2)
            root.angle += (0 - root.angle)*k.dt();
    }
    let gen_thresh = 200/k.debug.fps();
    let step_size = root.pos.x - root.prevX;
    let pos_x = 0;
    let pos_y = 0;
    if(speedY/k.debug.fps()<gen_thresh){
        root.last_gen += speedY/k.debug.fps();
        if(root.last_gen>gen_thresh){
            //continue
            root.last_gen = 0;
        }else{
            root.prevX = root.pos.x;
            return;
        }
    }
    let gen_num = Math.max(1,Math.floor(
    Math.sqrt((Math.pow(speedY/k.debug.fps(),2)+Math.pow(step_size,2))) / gen_thresh));
    let root_type;
    let branch = false;    
    for(var i=0;i<gen_num;i++){        
        if(i<gen_num){
            pos_y = i*gen_thresh;
            
            pos_x = (i/gen_num)*step_size;
        }else{
            pos_y = gen_num*gen_thresh;
            pos_x =  step_size;
        }
        root.last_branch +=1;
        if(root.last_branch>branch_thresh){
            root.last_branch = 0;
            branch = true;
            root.branch_direction = -root.branch_direction;
        }
        root_type = "root"+Math.floor(Math.random()*(root_type_num));

        k.add([
        k.sprite(root_type),
        k.pos(root.pos.x-pos_x,root.pos.y-pos_y),
        k.origin("center"),
        k.layer("obj"),
        k.scale(global_scale),
        k.rotate(root.angle),
        "root",
        {
        generated: false,
        root_id:"root1",
        root_head:false,
        root_type:root_type,
        root_generator: branch,
        stem_root:true,
        angle_mode:"down",
        generate_angle: root.angle+Math.PI/2,
        generate_direction : root.branch_direction,
        start_angle:root.angle +Math.PI/2,
        gen_delay: 100/speedY,
        branch_direction:-root.branch_direction,
        root_scale:0.8,
        root_time:Math.random()*branch_life,
        root_num:0
        }
    ]);    
    }
    root.prevX = root.pos.x;    
})
    /////////////////////////////////////////////
    });
    /////////////////////////////////////////////
    k.collides("root_head", "obstruction", (r, o) => {
        if(o.obs_type=="block"){
    r.stopped = true;
    total_root_num -=1;
    k.every("knob",(knob)=>{
        if(knob.root_id==r.root_id){
            k.destroy(knob);
        }
    });
    if(total_root_num==0){
        const start_button =  k.add([
            k.sprite("start"),
            k.pos(k.height()*0.4,k.height()*0.5),
            k.layer("ui"),
            k.scale(global_scale),
            k.origin("center"),
            "start_button"
        ]);
        k.add([
            k.sprite("nav"),
            k.pos(0,0),
            k.layer("ui"),
            k.scale(0.5*global_scale),
            "nav"
        ]);
        if(score!=0){
            best_scores.push(score);
            localStorage.setItem('best_scores',best_scores);
        }
        started = false;
    }        
        }else if(o.obs_type=="splitter"){
            k.destroy(o);
            if(total_root_num<4){
            if(r.pos.x+200>k.width()){
                addNewRoot(Math.random().toString(),r.pos.x,r.pos.x-k.width()*0.125);                
            }else{
                addNewRoot(Math.random().toString(),r.pos.x,r.pos.x+k.width()*0.125);                
            }
            
            }
            
        }    
});

/////////////////////////////////////////////
});
/////////////////////////////////////////////
///SCORES SCENE

k.scene("scores", () => {
    k.mouseDown(()=>{
        let mouseX = (k.mousePos().x*pixelScale/parseFloat(document.getElementById('game').style.width))*k.width();
        let mouseY = (k.mousePos().y*pixelScale/parseFloat(document.getElementById('game').style.height))*k.height();    
        k.every('close-nav',(b)=>{
            if((Math.abs(b.pos.x-mouseX)<100)
            && (Math.abs(b.pos.y-mouseY)<50)){
                closeNavMenu();
                k.destroy(b);
            }
        });
    });
    k.add([
        k.sprite("nav"),
        k.pos(k.width()-100,0),
        k.layer("ui"),
        k.scale(0.5*global_scale),
        "close-nav"
    ]); 
    k.add([
        k.text("best_scores", 32),
        k.scale(global_scale),
        k.pos(80, 80),
    ]);
    function closeNavMenu(){
        k.go("main");
        return;
    }
    
    
    best_scores.sort();
    best_scores = best_scores.reverse();
    for(var i=0;i<10;i++){
        if(i<best_scores.length){
            k.add([
                k.text(best_scores[i].toString(), 32),
                k.scale(global_scale),
                k.pos(80, 150+i*50),
            ]);        
        }
    }
});

k.go('main');
