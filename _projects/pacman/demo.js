var current_replay = null;
function setup(source) {
    if (current_replay != null)
        current_replay.pause();
    var replay = null;
    var bar = document.getElementById("status_bar");
    bar.innerHTML = "Loading replay file...";
    console.log("Loading replay...");
    var req = new XMLHttpRequest();
    req.open("GET", source, false);
    req.send(null);
    if (req.status == 200) {
        bar.innerHTML = "Successfully loaded replay file.";
        var replay = unpickle_replay(req.responseText, rules, config);
        replay.on_game_over = on_game_over;
        console.log("Loaded replay");
    } else {
        console.log("Failed to load replay");
        bar.innerHTML = "An error occurred while loading the replay file <br />" + req.status + ": " + req.statusText;
    }
    if (replay != null) {
        var canvas = document.getElementById("canvas");
        replay.set_canvas(canvas);
        replay.game.resize(canvas);

        console.log("Rendering first frame");
        draw(canvas, replay.game);
        current_replay = replay;
        var title = "Pacman CTF Replay: " + current_replay.game.team_names[0] + " vs. " + current_replay.game.team_names[1];
        document.title = title;
        document.getElementById("header").innerHTML = title;

        document.getElementById("run_button").disabled = false;
        document.getElementById("step_button").disabled = false;
        document.getElementById("reset_button").disabled = false;
    }
}
function toggle_run(button) {
    if (current_replay.i >= current_replay.length) {
        current_replay.reset();
        current_replay.resume();
        button.innerHTML = "Pause";
        return;
    }
    
    if (button.innerHTML == "Pause") {
        current_replay.pause();
        console.log("Pausing");
        button.innerHTML = "Resume";
    } else {
        console.log("Running");
        current_replay.resume();
        button.innerHTML = "Pause";
    }
}

function toggle_step(button) {
    current_replay.pause();
    document.getElementById("run_button").innerHTML = "Resume";
    current_replay.step_single()
}

function toggle_reset(button) {
    document.getElementById("run_button").innerHTML = "Run";
    current_replay.reset();
}

function on_game_over(replay) {
    var bar = document.getElementById("status_bar");
    var red_team = replay.team_names[RED];
    var blue_team = replay.team_names[BLUE];
    if (replay.game.food_left[RED] == config.MIN_FOOD) {
        var text = blue_team + " has captured all but " + config.MIN_FOOD + " of " + red_team + "'s dots.";
    } else if (replay.game.food_left[BLUE] == config.MIN_FOOD) {
        var text = red_team + " has captured all but " + config.MIN_FOOD + " of " + blue_team + "'s dots.";
    } else {
        if (replay.game.score == 0)
            var text = "Tie game!";
        else if (replay.game.score > 0)
            var text = red_team + " wins by " + replay.game.score + " points.";
        else
            var text = blue_team + " wins by " + (-replay.game.score) + " points.";
    }
    bar.innerHTML = text;
    document.getElementById("run_button").innerHTML = "Run";
}

document.addEventListener('DOMContentLoaded', function (event) {
    setup("replay.rec")
});
