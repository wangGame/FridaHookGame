function() {
    this.callbackVPAIDEvent(['onAdPaused']);
};

VPAIDWrapper.prototype.onAdDurationChange = function() {
    this.callbackVPAIDEvent(['onAdDurationChange',
        'duration', this.creative.getAdDuration()
    ]);
};

VPAIDWrapper.prototype.onAdRemainingTimeChange = function() {
    this.callbackVPAIDEvent(['onAdRemainingTimeChange',
        'remaining', this.creative.getAdRemainingTime()
    ]);
}

VPAIDWrapper.prototype.onAdUserAcceptInvitation = function() {
    this.callbackVPAIDEvent(['onAdUserAcceptInvitation']);
};

VPAIDWrapper.prototype.onAdUserMinimize = function() {
    this.callbackVPAIDEvent(['onAdUserMinimize']);
};

VPAIDWrapper.prototype.onAdUserClose = function() {
    this.callbackVPAIDEvent(['onAdUserClose']);
};

VPAIDWrapper.prototype.onAdExpandedChange = function() {
    this.callbackVPAIDEvent(['onAdExpandedChange',
        'expanded', this.creative.getAdExpanded()
    ]);
};

VPAIDWrapper.prototype.onAdClickThru = function(url, id, playerHandles) {
    this.callbackVPAIDEvent(['onAdClickThru',
        'url', url,
        'id', id,
        'playerHandles', playerHandles
    ]);
};

VPAIDWrapper.prototype.onAdInteraction = function(id) {
    this.callbackVPAIDEvent(['onAdInteraction',
        'id', id
    ]);
};

VPAIDWrapper.prototype.onAdLinearChange = function() {
    this.callbackVPAIDEvent(['onAdLinearChange',
        'adLinear', this.creative.getAdLinear()
    ]);
};

VPAIDWrapper.prototype.onAdVolumeChange = function() {
    var volume = this.creative.getAdVolume();
    if (volume <= 0) {
        console.log("muted");
        this.videoSlot.muted = true;
        this.videoSlot.volume = 0;
    } else {
        console.log("unmuted");
        this.videoSlot.muted = false;
        this.videoSlot.volume = volume;
    }
    this.callbackVPAIDEvent(['onAdVolumeChange',
        'volume', volume
    ]);
};

/////////////////////////// getter events //////////////////////////////
VPAIDWrapper.prototype.getAdVolume = function() {
    var volume = this.creative.getAdVolume();
    return volume;
};

VPAIDWrapper.prototype.getAdLinear = function() {
    var adLinear = this.creative.getAdLinear();
    return adLinear;
};

VPAIDWrapper.prototype.getAdExpanded = function() {
    var expanded = this.creative.getAdExpanded();
    return expanded;
};

VPAIDWrapper.prototype.getAdSkippableState = function() {
    var state = this.creative.getAdSkippableState();
    return state;
};

VPAIDWrapper.prototype.getAdRemainingTime = function() {
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