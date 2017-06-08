function Agent(index, x, y) {
    this.index = index;
    if (index % 2 == 0)
        this.team = RED;
    else
        this.team = BLUE;
    this.start = {x: x, y: y};
    this.facing = EAST;
    
    this.draw = function method_draw(ctx, layout, config) {
                    draw_agent(ctx, this, layout, config);
                };
    this.defeats = function method_defeats(other) {
                    return check_kills(this, other);
                };
    this.reset = function method_reset() {
                    this.x = this.start.x;
                    this.y = this.start.y;
                    this.type = GHOST;
                    this.scaredTimer = 0;
                };

    this.move = function method_move(direction, layout) {
        var changed = false;
        switch (direction) {
            case NORTH:
                var dx = 0; var dy = 1; break;
            case SOUTH:
                var dx = 0; var dy = -1; break;
            case EAST:
                var dx = 1; var dy = 0;
                var changed = (this.x == layout.width/2 - 1);
                break;
            case WEST:
                var dx = -1; var dy = 0;
                var changed = (this.x == layout.width/2);
                break;
            case STOP:
                var dx = dy = 0;
                break;
            default:
                var dx = 0; var dy = 0;
                console.log("Unknown direction: " + direction);
        }
        if (direction != STOP)
            this.facing = direction;
        if (changed) {
            if (this.type == PACMAN)
                this.type = GHOST;
            else
                this.type = PACMAN;
        }
        
        if (this.x + dx < 0 || this.x + dx >= layout.width)
            return {x: this.x, y: this.y};
        if (this.y + dy < 0 || this.y + dy >= layout.height)
            return {x: this.x, y: this.y};

        if (layout[layout.height-this.y-dy-1][this.x + dx] == "%") {
            console.log("Agent " + this.index + " attempted an illegal action");
            return {x: this.x, y: this.y};
        }
        this.x += dx;
        this.y += dy;
        return {x: this.x, y: this.y};
    };
    
    this.reset();
    return this;
}

function check_kills(agent1, agent2) {
    if (agent1.type == PACMAN) {
        if (agent2.type == GHOST)
            return (agent2.scaredTimer > 0);
    } else {
        if (agent2.type == PACMAN)
            return (agent1.scaredTimer == 0);
    }
    console.log("Got weird fight combination " + agent1.type + " and " + agent2.type);
    return false;
}

function hash_position(x,y) {
    return x + y*65535;
}

function Food(team, x, y) {
    //Team always refers to the team that can't use this/owns this
    this.team = team;
    this.x = x;
    this.y = y;
    this.scariness = 0;
    if (team == RED)
        this.value = -rules.FOOD_VALUE;
    else
        this.value = rules.FOOD_VALUE;
    this.draw = function method_draw(ctx, layout, config) {
                    draw_food(ctx, this, layout, config);
                };
    return this;
}

function Capsule(team, x, y) {
    this.team = team;
    this.x = x;
    this.y = y;
    this.scariness = rules.SCARED_TIME;
    this.value = 0;
    this.draw = function method_draw(ctx, layout, config) {
                    draw_capsule(ctx, this, layout, config);
                };
    return this;
}

function Game(team_names, layout, config) {
    this.team_names = team_names;
    this.layout = layout;
    this.score = 0;
    this.time_left = rules.GAME_LENGTH;
    this.items = {};
    this.agents = {};
    this.food_left = new Object();
    this.food_left[RED] = this.food_left[BLUE] = 0;
    this.config = config

    var agentPattern = new RegExp("[1-9]");
    for (var x=0; x < this.layout.width; x++) {
        for (var y=0; y < this.layout.height; y++) {
            var char = this.layout[this.layout.height-y-1][x];
            if (agentPattern.test(char)) {
                var index = Number(char) - 1;
                this.agents[index] = new Agent(index, x, y);
            } else if (char == ".") {
                if (x < layout.width/2)
                    var team = RED;
                else
                    var team = BLUE;
                this.food_left[team] += 1;
                this.items[hash_position(x,y)] = new Food(team, x, y);
            } else if (char == "o") {
                if (x < layout.width/2)
                    var team = RED;
                else
                    var team = BLUE;
                this.items[hash_position(x,y)] = new Capsule(team, x, y);
            }
        }
    }

    this.over = function over() {
        if (this.time_left == 0)
            return true;
        for (index in this.food_left)
            if (this.food_left[index] <= rules.MIN_FOOD)
                return true; 
        return false;
    };

    this.execute_action = function method_execute(agent_index, action) {
        var agent = this.agents[agent_index];
        var pos = agent.move(action, this.layout);
        this.pickup_consumable(agent, pos.x, pos.y);
        
        for (index in this.agents) {
            var other = this.agents[index]
            if (agent.team == other.team || other.x != pos.x || other.y != pos.y)
                continue;
            if (agent.defeats(other)) {
                if (agent.team == BLUE)
                    this.score -= rules.KILL_POINTS;
                else
                    this.score += rules.KILL_POINTS;
                other.reset();
            } else {
                if (other.team == BLUE)
                    this.score -= rules.KILL_POINTS;
                else
                    this.score += rules.KILL_POINTS;
                agent.reset();
            }
        }
        if (agent.scaredTimer > 0)
            agent.scaredTimer -= 1;
        this.time_left -= 1;
    };

    this.pickup_consumable = function method_pickup(agent, x, y) {
        var hash = hash_position(x,y);
        if (hash in this.items) {
            var item = this.items[hash];
            if (item.team == agent.team)
                return;
            this.score += item.value;
            if (item.value != 0)
                this.food_left[item.team] -= 1;

            if (item.scariness > 0)
                for (index in this.agents)
                    if (this.agents[index].team == item.team)
                        this.agents[index].scaredTimer = item.scariness;
            delete this.items[hash];
        }
    };

    this.set_config = function method_config(config) {
        this.config = config;
    };

    this.get_width = function method_width() {
        return this.layout.width * this.config.CELL_SIZE;
    };

    this.get_height = function method_height() {
        return this.layout.height * this.config.CELL_SIZE;
    };

    this.resize = function method_resize(canvas) {
        canvas.width = this.get_width();
        if (this.config.SHOW_INFO)
            canvas.height = this.get_height() + this.config.PANE_SIZE;
        else
            canvas.height = this.get_height();
    };

    return this;
}

function unpickle_replay(string, rules, config) {
    var dump = pickle.loads(string);
    var replay = new Object();
    replay.layout = dump.layout.layoutText;
    replay.layout.width = replay.layout[0].length;
    replay.layout.height = replay.layout.length;

    replay.actions = dump.actions;
    replay.length = replay.actions.length;

    replay.team_names = [dump.redTeamName, dump.blueTeamName];
    
    replay.game = new Game(replay.team_names, replay.layout, config);

    replay.i = 0;
    replay.interval_id = null;
    replay.step_single = function method_single() {
        if (replay.i >= replay.length)
            return true;
        
        var tuple = replay.actions[replay.i];
        replay.game.execute_action(tuple[0], tuple[1]);
        draw(replay.canvas, replay.game);
        replay.i += 1;
        return false;
    }
    replay.step = function method_step() {
        done = replay.step_single();
        if (done) {
            clearInterval(replay.interval_id);
            replay.interval_id = null;
            if (replay.on_game_over != null)
                on_game_over(replay);
            return;
        }
    };
    
    replay.pause = function method_pause() {
        if (replay.interval_id != null)
            clearInterval(replay.interval_id);
        replay.interval_id = null;
    };

    replay.resume = function method_resume() {
        replay.interval_id = setInterval(replay.step, rules.TURN_DELAY);
    };

    replay.reset = function method_reset() {
        replay.pause();
        replay.i = 0;
        replay.game = new Game(replay.team_names, replay.layout, config);
        draw(replay.canvas, replay.game);
    };

    replay.set_canvas = function method_set_canvas(canvas) {
        replay.canvas = canvas;
    };

    return replay;
}

function load_replay(json, rules, config) {
    var replay = eval("(" + json + ")");
    replay.layout.width = replay.layout[0].length;
    replay.layout.height = replay.layout.length;
    replay.length = replay.actions.length;
    replay.game = new Game(replay.team_names, replay.layout, config);

    replay.i = 0;
    replay.interval_id = null;
    replay.step_single = function method_single() {
        if (replay.i >= replay.length)
            return true;
        
        var tuple = replay.actions[replay.i];
        replay.game.execute_action(tuple[0], tuple[1]);
        draw(replay.canvas, replay.game);
        replay.i += 1;
        return false;
    }
    replay.step = function method_step() {
        done = replay.step_single();
        if (done) {
            clearInterval(replay.interval_id);
            replay.interval_id = null;
            if (replay.on_game_over != null)
                on_game_over(replay);
            return;
        }
    };
    
    replay.pause = function method_pause() {
        if (replay.interval_id != null)
            clearInterval(replay.interval_id);
        replay.interval_id = null;
    };

    replay.resume = function method_resume() {
        replay.interval_id = setInterval(replay.step, rules.TURN_DELAY);
    };

    replay.reset = function method_reset() {
        replay.pause();
        replay.i = 0;
        replay.game = new Game(replay.team_names, replay.layout, config);
        draw(replay.canvas, replay.game);
    };

    replay.set_canvas = function method_set_canvas(canvas) {
        replay.canvas = canvas;
    };

    return replay;
}
