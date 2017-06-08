function draw_agent(ctx, agent, layout, config) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(agent.x*config.CELL_SIZE, (layout.height-agent.y-1)*config.CELL_SIZE)
    ctx.fillStyle = config.AGENT_COLORS[agent.index];
    ctx.strokeStyle = config.AGENT_COLORS[agent.index];
    ctx.translate(config.CELL_SIZE/2, config.CELL_SIZE/2);
    if (agent.type == PACMAN) {
        var start = Math.PI/10;
        var end = -Math.PI/10;
        if (agent.facing == NORTH)
            ctx.rotate(-Math.PI/2);
        if (agent.facing == SOUTH)
            ctx.rotate(Math.PI/2);
        if (agent.facing == WEST)
            ctx.rotate(Math.PI);
        ctx.arc(0,0, config.CELL_SIZE/2, start, end, false);
        ctx.lineTo(0,0);
        ctx.stroke();
        ctx.fill();
    } else {
        if (agent.scaredTimer > 0) {
            ctx.fillStyle = config.SCARED_COLOR;
            ctx.strokeStyle = config.SCARED_COLOR;
        }
        scale = config.CELL_SIZE*0.65;
        ctx.moveTo( 0.00*scale,  0.30*scale);
        ctx.lineTo( 0.25*scale,  0.75*scale);
        ctx.lineTo( 0.50*scale,  0.30*scale);
        ctx.lineTo( 0.75*scale,  0.75*scale);
        ctx.lineTo( 0.75*scale, -0.50*scale);
        ctx.lineTo( 0.50*scale, -0.75*scale);
        ctx.lineTo(-0.50*scale, -0.75*scale);
        ctx.lineTo(-0.75*scale, -0.50*scale);
        ctx.lineTo(-0.75*scale,  0.75*scale);
        ctx.lineTo(-0.50*scale,  0.30*scale);
        ctx.lineTo(-0.25*scale,  0.75*scale);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.strokeStyle = "";

        ctx.beginPath();
        ctx.moveTo(0.35*scale, 0.30*scale);
        ctx.arc(0.35*scale, -0.30*scale, 0.30*scale, 0, 2*Math.PI, false);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-0.35*scale, 0.30*scale);
        ctx.arc(-0.35*scale, -0.30*scale, 0.30*scale, 0, 2*Math.PI, false);

        ctx.fill();

        switch (agent.facing) {
            case NORTH:
                var dx = 0; var dy = -1; break;
            case SOUTH:
                var dx = 0; var dy = 1; break;
            case EAST:
                var dx = 1; var dy = 0;
                break;
            case WEST:
                var dx = -1; var dy = 0; break;
            case STOP:
                var dx = dy = 0; break;
        }

        ctx.translate(0.08*scale*dx, 0.08*scale*dy);
        
        ctx.fillStyle = "black";
        ctx.strokeStyle = "";

        ctx.beginPath();
        ctx.moveTo(0.35*scale, 0.30*scale);
        ctx.arc(0.35*scale, -0.30*scale, 0.15*scale, 0, 2*Math.PI, false);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-0.35*scale, 0.30*scale);
        ctx.arc(-0.35*scale, -0.30*scale, 0.15*scale, 0, 2*Math.PI, false);

        ctx.fill();
        
            
    }
    ctx.restore();
}

function draw_food(ctx, consumable, layout, config) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(consumable.x*config.CELL_SIZE, (layout.height-consumable.y-1)*config.CELL_SIZE);
    ctx.fillStyle = config.TEAM_COLORS[consumable.team];
    ctx.strokeStyle = config.TEAM_COLORS[consumable.team];

    ctx.translate(config.CELL_SIZE/2, config.CELL_SIZE/2);
    ctx.arc(0,0, config.FOOD_SIZE, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function draw_capsule(ctx, consumable, layout, config) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(consumable.x*config.CELL_SIZE, (layout.height-consumable.y-1)*config.CELL_SIZE);
    ctx.fillStyle = config.CAPSULE_COLOR;
    ctx.strokeStyle = config.CAPSULE_COLOR;

    ctx.translate(config.CELL_SIZE/2, config.CELL_SIZE/2);
    ctx.arc(0,0, config.CAPSULE_SIZE, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function draw(canvas, game) {
    var ctx = canvas.getContext("2d");
    var config = game.config;
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    drawWalls(ctx, game.layout, game.config);

    ctx.globalCompositeOperation = "source-atop";

    ctx.fillStyle = config.TEAM_COLORS[0];
    ctx.fillRect(0,0, canvas.width/2, game.layout.height * config.CELL_SIZE);
    ctx.fillStyle = config.TEAM_COLORS[1];
    ctx.fillRect(canvas.width/2,0, canvas.width/2, game.layout.height * config.CELL_SIZE);

    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = config.BACKGROUND_COLOR;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.restore();

    if (config.SHOW_INFO) {
        ctx.save();
        ctx.translate(0, (game.layout.height + 0.5) * config.CELL_SIZE);
        draw_info(ctx, game, canvas.width, config.PANE_SIZE - 0.5*config.CELL_SIZE);
        ctx.restore();
    }

    for (var i in game.items) {
        game.items[i].draw(ctx, game.layout, game.config);
    }
    
    for (var i=0; i < 4; i++) {
        game.agents[i].draw(ctx, game.layout, game.config);
    }
}

function drawWalls(ctx, layout, config) {
    var CELL_SIZE = config.CELL_SIZE;
    var OFFSET = config.OFFSET;
    var RADIUS = config.RADIUS;
    function free(x,y) {
        if (0 > x || x >= layout.width)
            return 1;
        if (0 > y || y >= layout.height)
            return 1;
        return layout[y][x] != "%";
    }

    function occupied(x,y) {
        return !free(x,y);
    }
    ctx.beginPath();
    for (var y=-1; y <= layout.height; y++) {
        for (var x=-1; x <= layout.width; x++) {
            if (occupied(x,y)) {
                continue;
            }
            var A = occupied(x-1, y-1); var B = occupied(x, y-1); var C = occupied(x+1, y-1);
            var D = occupied(x-1, y);                             var F = occupied(x+1, y);
            var G = occupied(x-1, y+1); var H = occupied(x, y+1); var I = occupied(x+1, y+1);
            
            if (A) {
                var Xs = x*CELL_SIZE;
                var Ys = y*CELL_SIZE;
                if (B && D) {
                    ctx.moveTo(Xs-OFFSET,Ys+CELL_SIZE/2);
                    ctx.arc(Xs-OFFSET+RADIUS,Ys-OFFSET+RADIUS,
                            RADIUS, -Math.PI, -Math.PI/2, false);
                    ctx.lineTo(Xs+CELL_SIZE/2,Ys-OFFSET);
                } else if (B) {
                    ctx.moveTo(Xs, Ys-OFFSET);
                    ctx.lineTo(Xs+CELL_SIZE/2,Ys-OFFSET);
                } else if (D) {
                    ctx.moveTo(Xs-OFFSET, Ys);
                    ctx.lineTo(Xs-OFFSET, Ys+CELL_SIZE/2);
                } else {
                    ctx.moveTo(Xs-OFFSET, Ys-OFFSET-RADIUS);
                    ctx.arc(Xs-OFFSET-RADIUS, Ys-OFFSET-RADIUS,
                            RADIUS, 0, Math.PI/2, false);
                }
            }

            if (C) {
                var Xs = (x+1)*CELL_SIZE;
                var Ys = y*CELL_SIZE;
                if (F && B) {
                    ctx.moveTo(Xs-CELL_SIZE/2,Ys-OFFSET);
                    ctx.arc(Xs+OFFSET-RADIUS,Ys-OFFSET+RADIUS,
                            RADIUS, -Math.PI/2, 0, false);
                    ctx.lineTo(Xs+OFFSET,Ys+CELL_SIZE/2);
                } else if (F) {
                    ctx.moveTo(Xs+OFFSET, Ys);
                    ctx.lineTo(Xs+OFFSET, Ys+CELL_SIZE/2);
                } else if (B) {
                    ctx.moveTo(Xs-CELL_SIZE/2, Ys-OFFSET);
                    ctx.lineTo(Xs, Ys-OFFSET);
                } else {
                    ctx.moveTo(Xs+OFFSET+RADIUS, Ys-OFFSET);
                    ctx.arc(Xs+OFFSET+RADIUS, Ys-OFFSET-RADIUS,
                            RADIUS, Math.PI/2, Math.PI, false);
                }
            }
            if (I) {
                var Xs = (x+1)*CELL_SIZE;
                var Ys = (y+1)*CELL_SIZE;
                if (F && H) {
                    ctx.moveTo(Xs+OFFSET,Ys-CELL_SIZE/2);
                    ctx.arc(Xs+OFFSET-RADIUS,Ys+OFFSET-RADIUS,
                            RADIUS, 0, Math.PI/2, false);
                    ctx.lineTo(Xs-CELL_SIZE/2,Ys+OFFSET);
                } else if (F) {
                    ctx.moveTo(Xs+OFFSET, Ys-CELL_SIZE/2);
                    ctx.lineTo(Xs+OFFSET, Ys);
                } else if (H) {
                    ctx.moveTo(Xs-CELL_SIZE/2, Ys+OFFSET);
                    ctx.lineTo(Xs, Ys+OFFSET);
                } else {
                    ctx.moveTo(Xs+OFFSET, Ys+OFFSET+RADIUS);
                    ctx.arc(Xs+OFFSET+RADIUS, Ys+OFFSET+RADIUS,
                            RADIUS, -Math.PI, -Math.PI/2, false);
                }
            }
            if (G) {
                var Xs = x*CELL_SIZE;
                var Ys = (y+1)*CELL_SIZE;
                if (D && H) {
                    ctx.moveTo(Xs+CELL_SIZE/2,Ys+OFFSET);
                    ctx.arc(Xs-OFFSET+RADIUS,Ys+OFFSET-RADIUS,
                            RADIUS, Math.PI/2, Math.PI, false);
                    ctx.lineTo(Xs-OFFSET,Ys-CELL_SIZE/2);
                    
                } else if (D && G) {
                    ctx.moveTo(Xs-OFFSET, Ys-CELL_SIZE/2);
                    ctx.lineTo(Xs-OFFSET, Ys);
                } else if (H && G) {
                    ctx.moveTo(Xs+CELL_SIZE/2, Ys+OFFSET);
                    ctx.lineTo(Xs, Ys+OFFSET);
                } else if (G) {
                    ctx.moveTo(Xs-OFFSET-RADIUS, Ys+OFFSET);
                    ctx.arc(Xs-OFFSET-RADIUS, Ys+OFFSET+RADIUS,
                            RADIUS, -Math.PI/2, 0, false);
                }
            }
        }
    }
    ctx.stroke();
}

function draw_info(ctx, game, width, height) {
    ctx.save();
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = game.config.FONT;
    ctx.fillStyle = "yellow";
    ctx.fillText("SCORE: " + game.score, 0, 0, width/8);
    ctx.fillText("TIME: " + game.time_left, width/8+10, 0, width/8-10);

    ctx.fillStyle = config.TEAM_COLORS[0];
    ctx.fillText("RED: " + game.team_names[RED], width/4, 0, 3*width/8);

    ctx.fillStyle = config.TEAM_COLORS[1];
    ctx.fillText("BLUE: " + game.team_names[BLUE], 5*width/8, 0, 3*width/8);

    ctx.restore();
}
