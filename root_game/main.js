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
  if(window.innerHeight > window.innerWidth){
      document.getElementById('game').style.width = window.innerWidth;
      document.getElementById('game').style.height = window.innerHeight;
}else{
    document.getElementById('game').style.width = window.innerHeight*0.7;
    document.getElementById('game').style.height = window.innerHeight;
  }
}
reportWindowSize();

var soil_num = 2;
var root_width = 20;
var soil_width = 800;
var soil_height = 1000;
var speedY = 100;
var total_root_num = 0;
var started = false;
var score = 0;
var roots = {};
var root_obj = {};
var root_list = {};
var root_type_num = 1;
var branch_thresh = 30;
var branch_life = 20;
var global_scale = 0.5;
var global_scaleX = 0.5;
var global_scaleY = 1;
var root_start_posY = 0.4;
var pixelScale = 2;
var dist_moved = 0;

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
//for(var i=0;i<soil_num;i++){
//    k.loadSprite("soil"+i.toString(), i.toString()+".png");
//}

k.loadSprite("soil0", "soil1.png");
k.loadSprite("soil1", "soil2.png");

k.loadSprite("start","start.png");
k.loadSprite("leaf","background-long.png");

//for(var i=0;i<root_type_num;i++){
//    k.loadSprite("root"+i.toString(),"root"+i.toString()+".png");
//}

k.loadSprite("root0","rootroot.png");

k.loadSprite("knob","nr.png");
k.loadSprite("root_head","shoe-r.png");
k.loadSprite("rock1","rock1.png");
k.loadSprite("rock2","rock2.png");
k.loadSprite("water","water.png");
k.loadSprite("fossil","fossil.png");
k.loadSprite("platypus","platypus.png");

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
    dist_moved = 0;
    root_list = {};
    started = true;
    k.every("nav",(nav)=>{
        k.destroy(nav);
    })
    
    k.every("root",(root)=>{
        k.destroy(root);
    });
    k.every("knob",(knob)=>{
        k.destroy(knob);
    });
    k.every("obstruction",(obstruction)=>{
        k.destroy(obstruction);
    });
    k.every("root_head",(root_head)=>{
        k.destroy(root_head);
    });
    k.add([
            k.sprite("leaf"),
            k.pos(0,0),
            k.scale([global_scaleX,global_scaleY]),
            k.layer("bg"),
            "leaf"
]);
    addNewRoot("root1",k.width()*0.5,k.width()*0.5,false);
    addRandomObstruction();
}
k.add([
            k.sprite("leaf"),
            k.pos(0,0),
            k.scale([global_scaleX,global_scaleY]),
            k.layer("bg"),
            "leaf"
]);
 const start_button =  k.add([
            k.sprite("start"),
            k.pos(k.height()*0.4*global_scaleX,k.height()*0.5*global_scaleY),
            k.layer("ui"),
            k.scale([global_scaleX,global_scaleY]),
            k.origin("center"),
            "start_button"
    ]);

/////////////////////////////////////////////
/*
k.add([
    k.sprite("nav"),
    k.pos(0,0),
    k.layer("ui"),
    k.scale([global_scaleX,global_scaleY]),
    "nav"
]);
*/


function showNavMenu(){        
    k.go('scores');
    k.add([
        k.rect(k.height()*0.5, k.height()*0.5),
        k.color(k.rgba(0,0,0,0.8)),
        k.scale([global_scaleX,global_scaleY]),
        "nav-item"
    ]);
    k.add([
        k.text("nav1", 32),        
        k.pos(80, 80),
        k.scale([global_scaleX,global_scaleY]),
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
        k.scale([global_scaleX,global_scaleY]),
		k.layer("bg"),
        "soil",
            {
        generated:false
    }]);
}

/////////////////////////////////////////////
for(var i=0;i<=(k.width()/soil_width);i++){
for(var j=1;j<=((k.height())/soil_width)+2;j++){
    addRandomSoil(i*soil_width,j*soil_height+k.height()*2-soil_height);
}
}

function addNewRoot(root_id_param,initial_root,target_root,root_started){
    total_root_num +=1;
    roots[root_id_param] = target_root;
    root_list[root_id_param] = [];
    let root_pos;
    if(root_started){
        root_pos = k.pos(initial_root,k.height()*root_start_posY*global_scaleY)
    }else{
        root_pos = k.pos(initial_root,k.height()*1.05*global_scaleY)
    }
    root_obj[root_id_param] = k.add([
    k.sprite("root_head"),
    root_pos,
    k.scale([global_scaleX,global_scaleY]),
    k.layer("obj"),
    k.rotate(0),
    k.origin("top"),
    "root_head",    
    root_id_param,
        {
            root_id:root_id_param,
            root_head:true,
            stopped:false,
            started:root_started,
            prevX:initial_root,
            last_gen:0,
            last_branch:0,
            overlap_thresh:0,
            branch_direction:1,
        }
    ]);
    k.add([
        k.sprite("knob"),
        k.pos(roots[root_id_param],k.height()-50),
		k.scale([global_scaleX,global_scaleY]),
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
    ["fossil",200,800,1],
    ["rock2",600,600,1],
    ["rock2",250,500,1],
    ["rock1",500,1500,1]],
    ////////////////////
    [["beetle",800,500,0.5],
    ["rock2",100,300,1],
    ["platypus",50,700,1],
    ["rock2",0,500,1],
    ["rock2",250,700,1],
    ["fossil",350,1200,1],
    ["rock2",800,700,1],
    ["beetle",500,1500,0.8]],
    ////////////////////
    [["rock1",50,1200,1],
    ["platypus",400,1000,0.6],
    ["rock1",800,500,1],
    ["rock2",600,600,1],
    ["fossil",100,500,1],
    ["rock2",450,300,1],
    ["rock1",500,1500,1]],
    ////////////////////
    [["fossil",100,300,1],
    ["beetle",600,200,1],
    ["rock2",850,700,0.7],
    ["beetle",200,800,1],
    ["rock1",500,1500,1]],
    ////////////////////
    [["beetle",100,1200,1],
    ["rock2",400,800,1],
    ["platypus",0,500,1],
    ["rock2",600,600,1],
    ["rock2",650,500,1],
    ["fossil",750,300,1],
    ["rock1",500,1500,1]],
];

function addRandomObstruction(){
    let obstruction_chosen = obstructions_types[Math.floor(Math.random()*obstructions_types.length)];
    for(var i=0;i<obstruction_chosen.length;i++){
        let chosen = obstruction_chosen[i];
        k.add([
            k.sprite(chosen[0]),
            k.pos(chosen[1]*global_scaleX,(k.height()+k.height()*0.3+chosen[2])*global_scaleY),
            k.origin("center"),
            k.layer("obj"),
            k.scale([chosen[3]*global_scaleX,chosen[3]*global_scaleY]),
            k.solid(),
            "obstruction",
            {
                obs_type:"block",
                genObject:false,                
                tolerable_thresh:1,
                scaleX:chosen[3]*global_scaleX,
                scaleY:chosen[3]*global_scaleY
            }
        ]);
    }
    if(Math.random()<0.6){
        k.add([
            k.sprite("water"),
            k.pos(Math.random()*k.width(),k.height()+Math.random()+k.height()*0.6),
            k.origin("center"),
            k.layer("obj"),
            k.scale([global_scaleX,global_scaleY]),
            k.solid(),            
            "obstruction",
            {
                obs_type:"splitter",
                scaleX:global_scaleX,
                scaleY:global_scaleY
            }
        ]);
    }

    
    k.add([
        k.sprite("rock1"),
        k.pos(-k.height()*0.5,k.height()+k.height()*0.5),
        k.origin("center"),
        k.scale([global_scaleX,global_scaleY]),
        k.layer("obj"),
        k.solid(),
        "obstruction",
        {
            obs_type:"block",
            genObject:true
        }
    ]);    
};



k.action("root_head",(root)=>{
    if(!started){
        return;
    }
    if(root.pos.y>k.height()*root_start_posY){
        root.move(k.vec2(0,-speedY));
        return;
    }else{
        //continue
    }
    
    if(root.stopped){
        root.move(k.vec2(0,-speedY));
        if(root.pos.y<-k.height()*0.1){
            k.destroy(root);
        }
    }
    let dx = (speedY * (Math.abs(root.pos.x-roots[root.root_id])/ (k.width()*global_scaleX*1.2)))/k.debug.fps();
    let dy = speedY/k.debug.fps();
    let cur_root = k.vec2(root.pos);
    let last_root = root_list[root.root_id][root_list[root.root_id].length-1];

    if(Math.abs(root.pos.x-roots[root.root_id])>3){
        if(root.pos.x-roots[root.root_id]>0){
            dx = -dx;
        }
        for(var d=0;d<Math.ceil(Math.abs(dx));d++){
            root.pos.x += dx/Math.abs(dx);
            root_list[root.root_id].push(k.vec2(root.pos.x,root.pos.y+(d/Math.ceil(Math.abs(dx)))*speedY/(k.debug.fps()))); 
        }
        root.angle = Math.tanh(dx/dy);
        
    }else{
        if(Math.abs(root.angle - 0)>0.2)
            root.angle += (0 - root.angle)*k.dt();        
        for(var d=0;d<Math.ceil(Math.abs(dy));d++){
            root_list[root.root_id].push(k.vec2(root.pos.x,root.pos.y+d)); 
        }
    }    
    
    /*
    let q_t_x;
    let q_t_y;
    if(root_list.length>1){
        let lx,ly,t,m_x,m_y;
        for(var i_y=0;i_y<Math.ceil(cur_root.y-last_root.y);i_y++){
            if( Math.abs(Math.ceil(cur_root.x-last_root.x)) >0){ 
                t = i_y/Math.ceil(cur_root.y-last_root.y);
                m_x = last_root.x + (cur_root.x - last_root.x)/2;
                m_y = last_root.y + (cur_root.y - last_root.y)/2;

                q_t_x = Math.pow(1-t,2)*cur_root.x + 2*(1-t)*t*m_x + Math.pow(t,2)*last_root.x;
                q_t_y = Math.pow(1-t,2)*cur_root.y + 2*(1-t)*t*m_y + Math.pow(t,2)*last_root.y;
                root_list.push(k.vec2(q_t_x,q_t_y));
            }else{
                root_list.push(k.vec2(cur_root.x,cur_root.y-i_y)); 
            }            
        }
    }*/
    
    if(last_root){
        let m_x;
        let m_y;
        if(
            Math.abs(cur_root.y-last_root.y) >4
        ){
            for(var i_t=0;i_t<=1;i_t+=0.1){
                m_x = (i_t)*cur_root.x + (1-i_t)*last_root.x;
                m_y = (i_t)*cur_root.y + (1-i_t)*last_root.y;
                root_list[root.root_id].push(k.vec2(m_x,m_y));
            }
        }
    
    }
    
    root.prevX = root.pos.x; 
});

k.action("obstruction",(o)=>{    
    if(started==false){
        return;
    }
    o.move(k.vec2(0,-speedY));
    if(o.pos.y <=-k.height()*0.5){
        if(o.genObject==true){
            addRandomObstruction();
        }
        k.destroy(o);
    }

    k.every("root_head",(r)=>{
        return;
        if((Math.pow(r.pos.x-o.pos.x,2)/Math.pow(o.width*o.scaleX/2,2) + Math.pow(r.pos.y-o.pos.y,2)/Math.pow(o.height*o.scaleY/2,2))> 1){        
            return;
        }

        if(o.obs_type=="splitter"){
            k.destroy(o);
            if(total_root_num<4){
            if(r.pos.x+global_scaleX*k.width()*0.2>k.width()){
                addNewRoot(Math.random().toString(),r.pos.x,r.pos.x-k.width()*0.125*global_scaleX,true);                
            }else{
                addNewRoot(Math.random().toString(),r.pos.x,r.pos.x+k.width()*0.125*global_scaleX,true);                
            }
            
            }
            
        }else if(o.obs_type=="block"){
            r.overlap_thresh +=1;
            r.overlaped = true;
        if(r.overlap_thresh >= o.tolerable_thresh){
            if(r.stopped){

            }else{
                r.stopped = true;
                total_root_num -=1;
                k.every("knob",(knob)=>{
                    if(knob.root_id==r.root_id){
                        k.destroy(knob);
                    }
            });
        }

    if(total_root_num==0){
        const start_button =  k.add([
            k.sprite("start"),
            k.pos(k.height()*0.4*global_scaleX,k.height()*0.5*global_scaleY),
            k.layer("ui"),
            k.scale([
                global_scaleX,
                global_scaleY]),
            k.origin("center"),
            "start_button"
        ]);
        k.add([
            k.sprite("nav"),
            k.pos(0,0),
            k.layer("ui"),
            k.scale(
                [
                    global_scaleX,
                    global_scaleY]
            ),
            "nav"
        ]);
        if(score!=0){
            best_scores.push(score);
            localStorage.setItem('best_scores',best_scores);
        }
        started = false;
    }
    }}    
    });
});

k.action("leaf",(leaf)=>{
    if(started==false){
        return;
    }
    leaf.move(k.vec2(0,-speedY));
    dist_moved += speedY/k.debug.fps();
    if(leaf.pos.y<=-k.height()*2.2){
        k.destroy(leaf);        
    }    
});

k.action("root",(root)=>{
    if(started==false){
        return;
    }
    
    root.move(k.vec2(0,-speedY));
    
    /////////////////////////////////////////////
    if(root.pos.y<=-root_width || root.pos.y>=k.height()+root_width){
        k.destroy(root);
    }
    if(root.pos.x>=(k.width()+root_width) ||(root.pos.x < -root_width) ){
        k.destroy(root);
    }
});


k.action("soil",(soil)=>{
    if(started==false){
        return;
    }
    soil.move(k.vec2(0,-speedY));            
    if(soil.pos.y<=0 && soil.generated==false){        
        soil.generated = true;
        addRandomSoil(soil.pos.x,k.height()-(0-soil.pos.y))        
    }
    if(soil.pos.y <=-soil_height){
        k.destroy(soil);
    }
});

function combination(n,r){
    if(n==r){
        return 1;
    }else if(n==1){
        return 1;
    }else if(r==1){
        return n;
    }else if(n==0){
        return 1;
    }else if(r==0){
        return 1;
    }else{
        let prod = n;
        let prod_div = r;
        for(var i=1;i<r;i++){
            prod *= n-i;
            prod_div *= r-i;
        }
        return prod/prod_div;
    }
}

k.render(() => {
        for(var r_id in root_list){
            for(var i=0;i<root_list[r_id].length;i++){
                k.drawSprite("root0",
                    {
                        pos: k.vec2(root_list[r_id][i].x-2,root_list[r_id][i].y),
                        scale: [global_scaleX*0.3,global_scaleY*0.3],
                        center:"origin",
                    });
                /*
                k.drawRect(
                    k.vec2(root_list[i].x,root_list[i].y),
                   1,1
                );*/
                if(started==true){
                    root_list[r_id][i].y -= speedY/(k.debug.fps());            
                }
                if(root_list[r_id][i].y < -10){
                    root_list[r_id].splice(i,1);
                }            
        }
    }
    
    
    

    if(!started){
        return;
    }
    k.drawText("·", {
        size: 64,
        pos: k.mousePos(),
        origin: "center",
    });
    score += Math.ceil(Math.floor(speedY/50)/10 * (total_root_num+1));
    speedY +=0.1;
    k.drawText(score.toString(), {
        size: 64*global_scale,
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


/////////////////////////////////////////////


    /////////////////////////////////////////////
    });
    /////////////////////////////////////////////
    
k.every("root_head",(rh)=>{
    if(rh.overlaped==false){
        rh.overlap_thresh = 0;
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
        k.scale(
        [
            global_scaleX,
            global_scaleY]
        ),
        "close-nav"
    ]); 
    k.add([
        k.text("best_scores", 32),
        k.scale(
            [
                global_scaleX,
                global_scaleY]
        ),
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
                k.scale(
                    [
                        global_scaleX,
                        global_scaleY]
                ),
                k.pos(80, 150+i*50),
            ]);        
        }
    }
});

k.go('main');
