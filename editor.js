// Generated by CoffeeScript 1.6.2
(function() {
  var t7e,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  t7e = window.t7e || require('./t7e');

  t7e.Editor = (function() {
    var selection;

    Editor.init = function() {
      var editor;

      editor = new this;
      document.body.appendChild(editor.controls);
      return editor;
    };

    Editor.prototype.template = '<div class="t7e-controls">\n  <span class="t7e-controls-title">T7e</span>\n  <button name="start">Edit</button>\n  <button name="stop">Preview</button>\n  <button name="save">Save</button>\n\n  <div class="t7e-attributes-container"></div>\n</div>';

    selection = null;

    function Editor() {
      this.onAttributeKeyUp = __bind(this.onAttributeKeyUp, this);
      this.onSelectionKeyUp = __bind(this.onSelectionKeyUp, this);
      this.onDocumentClick = __bind(this.onDocumentClick, this);
      this.onControlsClick = __bind(this.onControlsClick, this);
      var _this = this;

      this.controls = (function() {
        var creationDiv;

        creationDiv = document.createElement('div');
        creationDiv.innerHTML = _this.template;
        return creationDiv.children[0];
      })();
      this.startButton = this.controls.querySelector('button[name="start"]');
      this.stopButton = this.controls.querySelector('button[name="stop"]');
      this.attributesContainer = this.controls.querySelector('.t7e-attributes-container');
      this.controls.addEventListener('click', this.onControlsClick, false);
      this.attributesContainer.addEventListener('keyup', this.onAttributeKeyUp, false);
      this.stopButton.disabled = true;
    }

    Editor.prototype.onControlsClick = function(e) {
      var target, _name;

      target = e.target || e.currentTarget;
      return typeof this[_name = target.name] === "function" ? this[_name].apply(this, arguments) : void 0;
    };

    Editor.prototype.start = function() {
      this.startButton.disabled = true;
      this.stopButton.disabled = false;
      document.documentElement.classList.add('t7e-edit-mode');
      document.addEventListener('click', this.onDocumentClick, false);
      return t7e.refresh(document.body, {
        literal: true
      });
    };

    Editor.prototype.onDocumentClick = function(e) {
      var target;

      target = e.target || e.currentTarget;
      if (__indexOf.call(this.controls.querySelectorAll('*'), target) >= 0) {
        return;
      }
      this.deselect();
      while (target != null) {
        if (typeof target.hasAttribute === "function" ? target.hasAttribute('data-t7e-key') : void 0) {
          break;
        }
        target = target.parentNode;
      }
      if (target != null) {
        this.select(target);
        e.preventDefault();
        return e.stopPropagation();
      }
    };

    Editor.prototype.select = function(element) {
      var attribute, currentValue, dataAttrs, key, shortAttribute, _results;

      this.selection = element;
      element.classList.add('t7e-selected');
      element.contentEditable = true;
      element.addEventListener('keyup', this.onSelectionKeyUp, false);
      element.focus();
      dataAttrs = t7e.dataAll(element);
      _results = [];
      for (attribute in dataAttrs) {
        key = dataAttrs[attribute];
        if (!((attribute.indexOf('attr-')) === 0)) {
          continue;
        }
        shortAttribute = attribute.slice('attr-'.length);
        currentValue = t7e(key, {
          literal: true
        });
        _results.push(this.attributesContainer.innerHTML += "<label>\n  <span class=\"t7e-attribute-label\">" + shortAttribute + "</span>\n  <input type=\"text\" name=\"" + shortAttribute + "\" value=\"" + currentValue + "\" />\n</label>");
      }
      return _results;
    };

    Editor.prototype.onSelectionKeyUp = function() {
      return t7e.dataSet(this.selection, 'modified', true);
    };

    Editor.prototype.onAttributeKeyUp = function(e) {
      var target;

      target = e.target || e.currentTarget;
      this.selection.setAttribute(target.name, target.value);
      return t7e.dataSet(this.selection, 'modified', true);
    };

    Editor.prototype.deselect = function() {
      var _ref, _ref1, _ref2;

      if ((_ref = this.selection) != null) {
        _ref.classList.remove('t7e-selected');
      }
      if ((_ref1 = this.selection) != null) {
        _ref1.contentEditable = 'inherit';
      }
      if ((_ref2 = this.selection) != null) {
        _ref2.removeEventListener('keyup', this.onSelectionKeyUp, false);
      }
      this.selection = null;
      return this.attributesContainer.innerHTML = '';
    };

    Editor.prototype.stop = function() {
      var attribute, dataAttrs, element, key, modifiedElements, newStrings, pointer, segment, segments, single, value, _i, _j, _len, _len1, _ref, _ref1;

      this.startButton.disabled = false;
      this.stopButton.disabled = true;
      document.documentElement.classList.remove('t7e-edit-mode');
      document.removeEventListener('click', this.onDocumentClick, false);
      this.deselect();
      modifiedElements = document.querySelectorAll('[data-t7e-modified]');
      newStrings = {};
      for (_i = 0, _len = modifiedElements.length; _i < _len; _i++) {
        element = modifiedElements[_i];
        key = t7e.dataGet(element, 'key');
        if (key) {
          newStrings[key] = element.innerHTML;
        }
        dataAttrs = t7e.dataAll(element);
        for (attribute in dataAttrs) {
          key = dataAttrs[attribute];
          if (!((attribute.indexOf('attr-')) === 0)) {
            continue;
          }
          attribute = attribute.slice('attr-'.length);
          newStrings[key] = element.getAttribute(attribute);
        }
      }
      for (key in newStrings) {
        value = newStrings[key];
        segments = key.split('.');
        single = {};
        pointer = single;
        _ref = segments.slice(0, -1);
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          segment = _ref[_j];
          if ((_ref1 = pointer[segment]) == null) {
            pointer[segment] = {};
          }
          pointer = pointer[segment];
        }
        pointer[segments.slice(-1)] = value;
        t7e.load(single);
      }
      return t7e.refresh();
    };

    Editor.prototype.save = function() {
      return console.log(JSON.stringify(t7e.strings));
    };

    Editor.prototype.destroy = function() {
      this.stop();
      this.controls.removeEventListener('click', this.onControlsClick, false);
      return this.controls.parentNode.removeChild(this.controls);
    };

    return Editor;

  })();

  if (typeof module !== "undefined" && module !== null) {
    module.exports = t7e.Editor;
  }

}).call(this);
