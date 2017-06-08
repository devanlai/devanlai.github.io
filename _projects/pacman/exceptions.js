var Exception = function() {
    if (arguments.length >= 1)
        this.message = arguments[0];
    else
        this.message = "Unknown exception";
    return this;
};

Exception.prototype.name = "Exception";
Exception.prototype.toString = function() {
    return "[" + this.name + ": " + this.message + "]";
};

var IndexError = function(array, index) {
    this.array = array;
    this.index = index;
    this.message = "Index " + this.index + " out of bounds for array " + this.array.toString() + " of length " + this.array.length;
    return this;
};

IndexError.prototype = new Exception();
IndexError.prototype.constructor = IndexError;
IndexError.prototype.name = "IndexError";

var EOFError = function() {
    if (arguments.length >= 1)
        this.message = arguments[0];
    else
        this.message = "Unknown exception";
    return this;
};

EOFError.prototype = new Exception();
EOFError.prototype.constructor = EOFError;
EOFError.prototype.name = "EOFError";

var ValueError = function(explanation, value) {
    this.explanation = explanation;
    this.value = value;
    this.message = "Invalid value " + value.toString() + " because '" + explanation + "'";
    return this;
};

ValueError.prototype = new Exception();
ValueError.prototype.constructor = ValueError;
ValueError.prototype.name = "ValueError";
