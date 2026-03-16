function() {
    var remaining = this.creative.getAdRemainingTime();
    return remaining;
};

VPAIDWrapper.prototype.getAdWidth = function() {
    var adWidth = this.creative.getAdWidth();
    return adWidth;
};

VPAIDWrapper.prototype.getAdHeight = function() {
    var adHeight = this.creative.getAdHeight();
    return adHeight;
};

VPAIDWrapper.prototype.getAdDuration = function() {
    var duration = this.creative.getAdDuration();
    return duration;
};

VPAIDWrapper.prototype.getAdCompanions = function() {
    return this.creative.getAdCompanions();
};

VPAIDWrapper.prototype.getAdIcons = function() {
    return this.creative.getAdIcons();
};