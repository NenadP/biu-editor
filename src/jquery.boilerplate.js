// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "biuEditor",
			defaults = {
				width: 500,
				height: 200,
				placeholderText: null,
				updateCallback: null
			};

	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			// Place initialization logic here
			// You already have access to the DOM element and
			// the options via the instance, e.g. this.element
			// and this.options
			// you can add more functions like the one below and
			// call them like so: this.yourOtherFunction(this.element, this.options).


			var element, containerDiv, that, editor, buttonPane, buttonBold, buttonItalic, buttonUnderline, placeholderText;

			that = this;
			element = $(this.element);

			// create a container div on the fly
			containerDiv = $("<div/>",{
				css : {
					width : this.options.width,
					height : this.options.height
				}
			});

			editor = $("<iframe/>",{
				frameborder : "0",
				css : {
					width : this.options.width,
					height : this.options.height
				}
			}).appendTo(containerDiv).get(0);

			//buttons
			buttonPane = $("<ul/>",{
				"class" : "biu-editor-buttons"
			}).prependTo(containerDiv);

			buttonBold = $("<li />").append($("<button />", {
				text : "Bold",
				type: "button",
				data : {
					commandName : "bold"
				},
				click : execCommand
			})).appendTo(buttonPane);

			buttonItalic = $("<li />").append($("<button />", {
				text : "Italic",
				type: "button",
				data : {
					commandName : "italic"
				},
				click : execCommand
			})).appendTo(buttonPane);

			buttonUnderline = $("<li />").append($("<button />", {
				text : "Underline",
				type: "button",
				data : {
					commandName : "underline"
				},
				click : execCommand
			})).appendTo(buttonPane);

			if (this.options.placeholderText !== null) {
				placeholderText = this.options.placeholderText;
			} else {
				placeholderText = "Entry Text";
			}

			function initEditor() {

				var iframeEditable;

				element.after(containerDiv);
				element.hide();

				iframeEditable = editor.contentWindow.document;
				iframeEditable.open();
				iframeEditable.close();
				iframeEditable.designMode = "on";

				that.iframeEditable = iframeEditable;

				$(that.iframeEditable).find("head")
						.append("<style type=\"text/css\">" +
						"body:empty:before {content: \""+ placeholderText + "\";color: #797F87;}\n" +
						"body {font-family: \"helvetica\"; font-size: \"18px\"; overflow-x: \"hidden\"}" +
						"</style>");

				$(iframeEditable).on("keypress click keyup", function(){
					element.val(iframeEditable.body.innerHTML);

					if (that.options.updateCallback !== null) {
						that.options.updateCallback();
					}

				});

				$(iframeEditable).on("paste", function(event){
					// prevent pasting rich html content and paste retrieved plain text instead
					event.preventDefault();
					editor.contentWindow.document.execCommand("inserttext", false, event.originalEvent.clipboardData.getData("Text"));

					if (that.options.updateCallback !== null) {
						that.options.updateCallback();
					}

				});

				$(iframeEditable).on("drop", function(event){
					event.preventDefault();
				});
			}

			function execCommand() {
				var contentWindow = editor.contentWindow;

				contentWindow.focus();
				contentWindow.document.execCommand($(this).data("commandName"), false, "");
				contentWindow.focus();

				element.val(editor.contentWindow.document.body.innerHTML);

				if (that.options.updateCallback !== null) {
					that.options.updateCallback();
				}

				return false;
			}

			initEditor();
		},
		getHtmlFromEditor: function() {
			return($(this.element).val());
		},
		insertHtmlInEditor: function(html) {
			$(this.iframeEditable).find("body").html(html);
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );
