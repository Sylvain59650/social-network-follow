/* global qs qsi followTemplates */

"use strict";

function isFunction(obj) { return typeof obj === "function" }

if (!Array.prototype.find) {
  Array.prototype.find = function(fn) {
    var founds = this.filter(fn);
    if (founds !== null && founds.length > 0) {
      return founds[0];
    }
    return null;
  }
}

var getOrApply = function(value, context, args2) {
  if (isFunction(value)) {
    return value.apply(context, [args2]);
  }
  return value;
};

const showLabelMinWidth = 640;
const containerClass = "socials";
const shareClass = "social";
const shareLinkClass = "social-link";
const shareLogoClass = "social-logo";
const shareLabelClass = "social-label";


export class Follow {

  constructor(config) {
    this.btns = null;
    window.on("resize", this.onWindowResize);
    this.update(config);
  }


  showLabel(screenWidth) {
    return (screenWidth > showLabelMinWidth);
  }


  onWindowResize() {
    if (isFunction(this.showLabel)) {
      window.clearTimeout(this._resizeTimer);
      this._resizeTimer = window.setTimeout(this.render, 200);
    }
  }


  getShare(shareName) {
    return this.config.follows.find(x => x.name === shareName);
  }


  update(config) {
    config.follows = config.follows.map(x => {
      var found = followTemplates.find(y => y.name === x.name);
      if (found) {
        found.url = x.url;
      }
      return found;
    });
    this.config = Object.assign({ events: [] }, config);
    this.container = qsi(this.config.containerId);
    this.container.addClass(containerClass);
    this.render();
  }


  render() {
    this._clear();
    this._showLabel = getOrApply(this.showLabel, this, screen.width);

    this.btns = newElement("span");
    this.container.beforeEnd(this.btns);
    this._renderShareButtons();
  }



  _renderShareButtons() {
    var ctx = this;
    this.config.follows.forEach(function(share) {
      ctx._renderShare(share);
    })
  }


  _renderShare(share) {
    var btn = null;
    if (isFunction(share.renderer)) {
      btn = newElement("p", { class: shareClass }, share.renderer());
    } else {
      btn = this.createButton(share);
    }
    this.btns.beforeEnd(btn);
    btn.addClass(share.name);
  }


  createButton(share) {
    return this.createButtonLink(share);
  }


  onShareClick(share) {
    window.open(share.url);
  }

  createButtonLink(share) {
    var ctx = this;
    var link = newElement("a", { href: "#", class: shareLinkClass, title: share.tooltip || "" }, "", { click: function() { ctx.onShareClick(share); } });
    link.beforeEnd(this.createButtonLogo(share));
    if (this.config.showLabel && this._showLabel) {
      link.beforeEnd(this.createButtonLabel(share));
      if (this.config.minWidthWithLabel) {
        link.css({ "min-width": this.config.minWidthWithLabel });
      }
    }
    if (this.config.events !== null) {
      this.config.events.forEach(function(event, handler) {
        if (isFunction(handler)) {
          link.on(event, share);
        }
      });
    }
    return link;
  }


  createButtonLogo(share) {
    var icon = null;
    if (share.img != null) {
      icon = newElement("img", { src: share.img });
    } else {
      icon = newElement("i", { class: share.class });
    }
    icon.addClass(shareLogoClass);
    return icon;
  }

  createButtonLabel(share) {
    return newElement("span", { class: shareLabelClass }, share.label);
  }




  _clear() {
    window.clearTimeout(this._resizeTimer);
    this.container.html("");
  }

  destroy() {
    this._clear();
    window.off("resize", this.onWindowResize);
    this.container
      .removeClass(containerClass);
  }
}