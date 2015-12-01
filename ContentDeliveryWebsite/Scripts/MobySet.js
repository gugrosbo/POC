var Set = function () {
    this.hastable = new Object();
};

Set.prototype.add = function (o) { this.hastable[o] = true; };
Set.prototype.remove = function (o) { delete this.hastable[o]; };
Set.prototype.asArray = function () {
    var retVal = new Array();
    for (var k in this.hastable) {
        retVal.push(k);
    }
    return retVal;
};