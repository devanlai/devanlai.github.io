var pickle = (function() {


var Tuple = function() {
    if (arguments.length == 1) {
        for (var i=0; i < arguments[0].length; i++)
            this.push(arguments[0][i]);
    }
    return this;
};

Tuple.prototype = new Array();
Tuple.prototype.constructor = Tuple;
Tuple.prototype.toString = function() {
    return "(" + this.join() + ")";
};

var Unpickler = function(input) {
    this.input = input;
    this.position = 0;
    this.throws = false;
    if (arguments.length > 1)
        this.throws = arguments[1];

    this.memo = {};
};


Unpickler.prototype.read = function(n) {
    var bytes = this.input.substr(this.position, n)
    this.position += bytes.length;
    return bytes;
};

Unpickler.prototype.readline = function() {
    var index = this.input.indexOf("\n", this.position);
    if (index == -1) {
        var line = this.input.substr(this.position);
        this.position = this.input.length;
    } else {
        //Note: we omit the trailing newline. This is different from Python.
        var line = this.input.substring(this.position, index);
        this.position = index + 1;
    }
    return line;
};

Unpickler.prototype.marker = function() {
    var index = this.stack.length - 1;
    while (this.stack[index] !== this.mark) {
        if (this.throws && index < 0)
            throw new ValueError("Cannot locate mark on stack", this.stack);
        index--;
    }
    return index;
};

Unpickler.prototype.push = function(element) {
    return this.stack.push(element);
};

Unpickler.prototype.pop = function() {
    if (this.throws) {
        if (arguments.length == 0 && this.stack.length == 0)
            throw new IndexError(this.stack, 0);
        else if (arguments.length == 1 && this.stack.length <= arguments[0])
            throw new IndexError(this.stack, arguments[0]);
    }
    
    if (arguments.length == 0) {
        var element = this.stack.pop();
    } else {
        var index = arguments[0];
        var element = this.stack[index];
        this.stack.splice(index, 1);
    }
    return element;
};

Unpickler.prototype.popmark = function() {
    var index = this.marker();
    var elements = this.stack.splice(index+1, this.stack.length-index-1);
    this.pop();

    return elements;
};

Unpickler.prototype.peek = function() {
    if (this.throws && this.stack.length == 0)
        throw new IndexError(this.stack, 0);
    return this.stack[this.stack.length - 1];
};


Unpickler.prototype.load = function() {
    this.mark = new Object();
    this.stack = [];

    var done = false;
    while (!done) {
        var key = this.read(1);
        var method = this.dispatch[key];
        if (method == undefined && this.throws)
            throw new ValueError("Unknown opcode character", key);
        done = this[this.dispatch[key]]();
    }

    return this.pop();
};

Unpickler.prototype.load_proto = function() {
    var proto = this.read(1).charCodeAt(0);
    if (proto != 0)
        throw new ValueError("Unsupported pickle protocol", proto);
};

Unpickler.prototype.load_stop = function() {
    return true;
};

Unpickler.prototype.load_eof = function() {
    throw new EOFError();
};

Unpickler.prototype.load_mark = function() {
    this.push(this.mark);
};

Unpickler.prototype.load_get = function() {
    this.push(this.memo[this.readline()]);
};

Unpickler.prototype.load_binget = function() {
    this.push(this.memo[this.read(1).charCodeAt(0).toString()]);
};

Unpickler.prototype.load_put = function() {
    this.memo[this.readline()] = this.peek();
};

Unpickler.prototype.load_binput = function() {
    this.memo[this.read(1).charCodeAt(0).toString()] = this.peek();
};

Unpickler.prototype.load_pop = function() {
    this.pop();
};

Unpickler.prototype.load_pop_mark = function() {
    var k = this.marker();
    this.stack.splice(k, this.stack.length - k);
};

Unpickler.prototype.load_none = function() {
    this.push(null);
};

Unpickler.prototype.load_false = function() {
    this.push(false);
};

Unpickler.prototype.load_true = function() {
    this.push(true);
};

Unpickler.prototype.load_dup = function() {
    this.push(this.peek());
};

Unpickler.prototype.load_float = function() {
    this.push(parseFloat(this.readline()));
};

Unpickler.prototype.load_int = function() {
    var data = this.readline();
    if (data == "00") {
        var value = false;
    } else if (data == "01") {
        var value = true;
    } else {
        var value = parseInt(data, 10);
    }
    this.push(value);
};

Unpickler.prototype.load_long = function() {
    this.push(parseInt(this.readline(), 10));
};

function decode_literal(string) {
    if (string.indexOf("\\") == -1)
        return string;
    
    var escaped = false;
    var chars = [];
    for (var i=0; i < string.length; i++) {
        var char = string.charAt(i);
        if (escaped) {
            switch (char) {
                case '\\':
                    chars.push('\\');
                    break;
                case 'n':
                    chars.push('\n');
                    break;
                case '\'':
                    chars.push('\'');
                    break;
                case '"':
                    chars.push('"');
                    break;
                case 'a':
                    chars.push('\a');
                    break;
                case 'b':
                    chars.push('\b');
                    break;
                case 'f':
                    chars.push('\f');
                    break;
                case 'r':
                    chars.push('\r');
                    break;
                case 't':
                    chars.push('\t');
                    break;
                case 'v':
                    chars.push('\v');
                    break;
                case 'x':
                    chars.push(String.fromCharCode(parseInt(string.substr(i+1, 2), 16)));
                    i += 2;
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    chars.push(String.fromCharCode(parseInt(string.substr(i, 3), 8)));
                    i += 2;
                    break;
            }
            escaped = false;
        } else if (char == '\\') {
            escaped = true;
        } else {
            chars.push(char);
        }
    }

    return chars.join("");
};

Unpickler.prototype.load_string = function() {
    var repr = this.readline();
    var found = 0;
    for (var i=0; i < ["'", '"'].length; i++) {
        var quote = ["'", '"'][i];
        if (repr[0+found] == quote) {
            if (repr[repr.length-1-found] != quote && this.throws)
                throw new ValueError("Improperly quoted string in pickle", repr);
            else
                found += 1;
        }
    }
    if (found < 1 && this.throws)
        throw ValueError("Unquoted string in pickled", repr);

    this.push(decode_literal(repr.substring(found,repr.length-found)))
};

Unpickler.prototype.load_tuple = function() {
    this.push(new Tuple(this.popmark()));
};

Unpickler.prototype.load_empty_tuple = function() {
    this.push(new Tuple([]));
};

Unpickler.prototype.load_tuple1 = function() {
    this.push([new Tuple(this.pop())]);
};

Unpickler.prototype.load_tuple2 = function() {
    var second = this.pop();
    var first = this.pop();
    this.push(new Tuple([first, second]));
};

Unpickler.prototype.load_tuple3 = function() {
    var third = this.pop();
    var second = this.pop();
    var first = this.pop();
    this.push(new Tuple([first, second, third]));
};

Unpickler.prototype.load_empty_list = function() {
    this.push([]);
};

Unpickler.prototype.load_empty_dictionary = function() {
    this.push({});
};

Unpickler.prototype.load_list = function() {
    this.push(this.popmark());
};

Unpickler.prototype.load_dict = function() {
    var k = this.marker();
    var dict = {};
    var items = this.popmark();
    for (var i=0; i < items.length; i += 2)
        dict[items[i]] = items[i+1];
    this.push(dict);
};

Unpickler.prototype.load_inst = function() {
    var module = this.readline();
    var name = this.readline();
    var args = new Tuple(this.popmark());
    var inst = new Object();
    inst.__class__ = module + "." + name;
    inst.__args__ = args;
    //XXX: do instantiation correctly.
    this.push(inst);
};

Unpickler.prototype.load_obj = function() {
    var args = new Tuple(this.popmark());
    var klass = args.shift();
    var inst = new Object();
    inst.__class__ = klass;
    inst.__args__ = args;
    
    //XXX: do new-style instantiation correctly
    this.push(inst);
};

Unpickler.prototype.load_newobj = function() {
    var args = new Tuple(this.pop());
    var klass = this.pop();

    var inst = new Object();
    inst.__class__ = klass;
    inst.__args__ = args;

    this.push(inst);
};

Unpickler.prototype.load_build = function() {
    var state = this.pop();
    var inst = this.peek();
    for (var key in state)
        inst[key] = state[key];
};

Unpickler.prototype.load_append = function() {
    var element = this.pop();
    var list = this.peek();
    list.push(element);
};

Unpickler.prototype.load_appends = function() {
    var k = this.marker();
    var list = this.stack[k - 1];
    this.pop(k);
    var elements = this.stack.splice(k, this.stack.length - k);
    for (var i=0; i < elements.length; i++)
        list.push(elements[i]);
};


Unpickler.prototype.load_setitem = function() {
    var value = this.pop();
    var key = this.pop();
    this.peek()[key] = value;
};

Unpickler.prototype.load_setitems = function() {
    var k = this.marker();
    var dict = this.stack[k - 1];
    this.pop(k);
    var items = this.stack.splice(k, this.stack.length - k);
    for (var i=0; i < items.length; i += 2)
        dict[items[i]] = items[i+1];
};

Unpickler.prototype.opcodes = {
    MARK:       "(",
    STOP:       ".",
    POP:        "0",
    POP_MARK:   "1",
    DUP:        "2",
    FLOAT:      "F",
    INT:        "I",
    LONG:       "L",
    NONE:       "N",
    STRING:     "S",
    APPEND:     "a",
    BUILD:      "b",
    DICT:       "d",
    EMPTY_DICT: "}",
    APPENDS:    "e",
    GET:        "g",
    BINGET:     "h",
    INST:       "i",
    LIST:       "l",
    EMPTY_LIST: "]",
    OBJ:        "o",
    PUT:        "p",
    BINPUT:     "q",
    SETITEM:    "s",
    TUPLE:      "t",
    EMPTY_TUPLE:")",
    SETITEMS:   "u",
};

Unpickler.prototype.dispatch = {};
for (var opcode_name in Unpickler.prototype.opcodes) {
    var method = "load_"+opcode_name.toLowerCase()
    Unpickler.prototype.dispatch[Unpickler.prototype.opcodes[opcode_name]] = method;
}

var module = {
    Unpickler: Unpickler,
    tuple: Tuple,
    loads: function loads(input) {
        var up = new Unpickler(input);
        return up.load(true);
    },
};

return module;
})();
