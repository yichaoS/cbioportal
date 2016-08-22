/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob&&navigator.msSaveOrOpenBlob.bind(navigator)||function(view){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link="download"in save_link,click=function(node){var event=doc.createEvent("MouseEvents");event.initMouseEvent("click",true,false,view,0,0,0,0,0,false,false,false,false,0,null);node.dispatchEvent(event)},webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,arbitrary_revoke_timeout=500,revoke=function(file){var revoker=function(){if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}};if(view.chrome){revoker()}else{setTimeout(revoker,arbitrary_revoke_timeout)}},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},FileSaver=function(blob,name){var filesaver=this,type=blob.type,blob_changed=false,object_url,target_view,dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(blob_changed||!object_url){object_url=get_URL().createObjectURL(blob)}if(target_view){target_view.location.href=object_url}else{var new_tab=view.open(object_url,"_blank");if(new_tab==undefined&&typeof safari!=="undefined"){view.location.href=object_url}}filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url)},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:true,exclusive:false},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}if(can_use_save_link){object_url=get_URL().createObjectURL(blob);save_link.href=object_url;save_link.download=name;click(save_link);filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url);return}if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=true}if(webkit_req_fs&&name!=="download"){name+=".download"}if(type===force_saveable_type||webkit_req_fs){target_view=view}if(!req_fs){fs_error();return}fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event);revoke(file)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:false},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name){return new FileSaver(blob,name)};FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (window.cbio === undefined)
{
  window.cbio = {};
}

window.cbio.util = (function() {

  var deepCopyObject = function (obj) {
    return $.extend(true, ($.isArray(obj) ? [] : {}), obj);
  };
  var objectValues = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };
  var objectKeyDifference = function (from, by) {
    var ret = {};
    var from_keys = Object.keys(from);
    for (var i = 0; i < from_keys.length; i++) {
      if (!by[from_keys[i]]) {
        ret[from_keys[i]] = true;
      }
    }
    return ret;
  };
  var objectKeyValuePairs = function (obj) {
    return Object.keys(obj).map(function (key) {
      return [key, obj[key]];
    });
  };
  var objectKeyUnion = function (list_of_objs) {
    var union = {};
    for (var i = 0; i < list_of_objs.length; i++) {
      var keys = Object.keys(list_of_objs[i]);
      for (var j = 0; j < keys.length; j++) {
        union[keys[j]] = true;
      }
    }
    return union;
  };
  var objectKeyIntersection = function(list_of_objs) {
    var intersection = {};
    for (var i = 0; i < list_of_objs.length; i++) {
      if (i === 0) {
        var keys = Object.keys(list_of_objs[0]);
        for (var j = 0; j < keys.length; j++) {
          intersection[keys[j]] = true;
        }
      } else {
        var obj = list_of_objs[i];
        var keys = Object.keys(intersection);
        for (var j=0; j<keys.length; j++) {
          if (!obj[keys[j]]) {
            delete intersection[keys[j]];
          }
        }
      }
    }
    return intersection;
  };
  var stringListToObject = function (list) {
    var ret = {};
    for (var i = 0; i < list.length; i++) {
      ret[list[i]] = true;
    }
    return ret;
  };
  var stringListDifference = function (from, by) {
    return Object.keys(
      objectKeyDifference(
        stringListToObject(from),
        stringListToObject(by)));
  };
  var stringListUnion = function (list_of_string_lists) {
    return Object.keys(
      objectKeyUnion(
        list_of_string_lists.map(function (string_list) {
          return stringListToObject(string_list);
        })
      ));
  };
  var stringListUnique = function (list) {
    return Object.keys(stringListToObject(list));
  };
  var flatten = function(list_of_lists) {
    return list_of_lists.reduce(function(a,b) { return a.concat(b); }, []);
  };

  var makeCachedPromiseFunction = function (fetcher) {
    // In: fetcher, a function that takes a promise as an argument, and resolves it with the desired data
    // Out: a function which returns a promise that resolves with the desired data, deep copied
    //	The idea is that the fetcher is only ever called once, even if the output function
    //	of this method is called again while it's still waiting.
    var fetch_promise = new $.Deferred();
    var fetch_initiated = false;
    return function () {
      var def = new $.Deferred();
      if (!fetch_initiated) {
        fetch_initiated = true;
        fetcher(this, fetch_promise);
      }
      fetch_promise.then(function (data) {
        def.resolve(deepCopyObject(data));
      });
      return def.promise();
    };
  };
  

    var toPrecision = function(number, precision, threshold) {
        // round to precision significant figures
        // with threshold being the upper bound on the numbers that are
        // rewritten in exponential notation

        if (0.000001 <= number && number < threshold) {
            return number.toExponential(precision);
        }

        var ret = number.toPrecision(precision);
        //if (ret.indexOf(".")!==-1)
        //    ret = ret.replace(/\.?0+$/,'');

        return ret;
    };

    var getObjectLength = function(object) {
        var length = 0;

        for (var i in object) {
            if (Object.prototype.hasOwnProperty.call(object, i)){
                length++;
            }
        }
        return length;
    };

    var checkNullOrUndefined = function(o) {
        return o === null || typeof o === "undefined";
    };

    // convert from array to associative array of element to index
    var arrayToAssociatedArrayIndices = function(arr, offset) {
        if (checkNullOrUndefined(offset)) offset=0;
        var aa = {};
        for (var i=0, n=arr.length; i<n; i++) {
            aa[arr[i]] = i+offset;
        }
        return aa;
    };
        
    var uniqueElementsOfArray = function(arr) {
        var ret = [];
        var aa = {};
        for (var i=0, n=arr.length; i<n; i++) {
            if (!(arr[i] in aa)) {
                ret.push(arr[i]);
                aa[arr[i]] = 1;
            }
        }
        return ret;
    };

    var alterAxesAttrForPDFConverter = function(xAxisGrp, shiftValueOnX, yAxisGrp, shiftValueOnY, rollback) {

        // To alter attributes of the input D3 SVG object (axis)
        // in order to prevent the text of the axes from moving up
        // when converting the SVG to PDF
        // (TODO: This is a temporary solution, need to debug batik library)
        //
        // @param xAxisGrp: the x axis D3 object
        // @param shiftValueOnX: increased/decreased value of the x axis' text vertical position of the text of x axis
        //                       before/after conversion
        // @param yAxisGrp: the y axis D3 object
        // @param shiftValueOnY: increased/decreased value of the y axis' text vertical position of the text of x axis
        //                       before/after conversion
        // @param rollback: the switch to control moving up/down the axes' text (true -> move up; false -> move down)
        //

        if (rollback)
        {
            shiftValueOnX = -1 * shiftValueOnX;
            shiftValueOnY = -1 * shiftValueOnY;
        }

        var xLabels = xAxisGrp
            .selectAll(".tick")
            .selectAll("text");

        var yLabels = yAxisGrp
            .selectAll(".tick")
            .selectAll("text");

        // TODO:
        // shifting axis tick labels a little bit because of
        // a bug in the PDF converter library (this is a hack!)
        var xy = parseInt(xLabels.attr("y"));
        var yy = parseInt(yLabels.attr("y"));

        xLabels.attr("y", xy + shiftValueOnX);
        yLabels.attr("y", yy + shiftValueOnY);
    };

    /**
     * Determines the longest common starting substring
     * for the given two strings
     *
     * @param str1  first string
     * @param str2  second string
     * @return {String} longest common starting substring
     */
    var lcss = function (str1, str2)
    {
        var i = 0;

        while (i < str1.length && i < str2.length)
        {
            if (str1[i] === str2[i])
            {
                i++;
            }
            else
            {
                break;
            }
        }

        return str1.substring(0, i);
    };

	/**
	 * Converts base 64 encoded string into an array of byte arrays.
	 *
	 * @param b64Data   base 64 encoded string
	 * @param sliceSize size of each byte array (default: 512)
	 * @returns {Array} an array of byte arrays
	 */
	function b64ToByteArrays(b64Data, sliceSize) {
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		return byteArrays;
	}

	/**
	 * Detects browser and its version.
	 * This function is implemented as an alternative to the deprecated jQuery.browser object.
	 *
	 * @return {object} browser information as an object
	 */
	var detectBrowser = function ()
	{
		var browser = {};
		var uagent = navigator.userAgent.toLowerCase();

		browser.firefox = /mozilla/.test(uagent) &&
		                  /firefox/.test(uagent);

		browser.mozilla = browser.firefox; // this is just an alias

		browser.chrome = /webkit/.test(uagent) &&
		                 /chrome/.test(uagent);

		browser.safari = /applewebkit/.test(uagent) &&
		                 /safari/.test(uagent) &&
		                 !/chrome/.test(uagent);

		browser.opera = /opera/.test(uagent);

		browser.msie = /msie/.test(uagent);

		browser.version = "";

		// check for IE 11
		if (!(browser.msie ||
		      browser.firefox ||
		      browser.chrome ||
		      browser.safari ||
		      browser.opera))
		{
			// TODO probably we need to update this for future IE versions
			if (/trident/.test(uagent))
			{
				browser.msie = true;
				browser.version = 11;
			}
		}

		if (browser.version === "")
		{
			for (var x in browser)
			{
				if (browser[x])
				{
					browser.version = uagent.match(new RegExp("(" + x + ")( |/)([0-9]+)"))[3];
					break;
				}
			}
		}

		return browser;
	};

	/**
	 * Retrieves the page origin from the global window object. This function is
	 * introduced to eliminate cross-browser issues (window.location.origin is
	 * undefined for IE)
	 */
	var getOrigin = function()
	{
		var origin = window.location.origin;

		if (!origin)
		{
			origin = window.location.protocol + "//" +
			         window.location.hostname +
			         (window.location.port ? ':' + window.location.port: '');
		}

		return origin;
	};
        
        var sortByAttribute = function(objs, attrName) {
            function compare(a,b) {
                if (a[attrName] < b[attrName])
                    return -1;
                if (a[attrName] > b[attrName])
                    return 1;
                return 0;
            }
            objs.sort(compare);
            return objs;
        };
        
	/**
	 * Replaces problematic characters with an underscore for the given string.
	 * Those characters cause problems with the properties of an HTML object,
	 * especially for the id and class properties.
	 *
	 * @param property  string to be modified
	 * @return {string} safe version of the given string
	 */
	var safeProperty = function(property)
	{
		return property.replace(/[^a-zA-Z0-9-]/g,'_');
	};

	/**
	 * Hides the child html element on mouse leave, and shows on
	 * mouse enter. This function is designed to hide a child
	 * element within a parent element.
	 *
	 * @param parentElement target of mouse events
	 * @param childElement  element to show/hide
	 */
	function autoHideOnMouseLeave(parentElement, childElement)
	{
		$(parentElement).mouseenter(function(evt) {
			childElement.fadeIn({complete: function() {
				$(this).css({"visibility":"visible"});
				$(this).css({"display":"inline"});
			}});
		});

		$(parentElement).mouseleave(function(evt) {
			// fade out without setting display to none
			childElement.fadeOut({complete: function() {
				// fade out uses hide() function, but it may change
				// the size of the parent element
				// so this is a workaround to prevent resize
				// due to display: "none"
				$(this).css({"visibility":"hidden"});
				$(this).css({"display":"inline"});
			}});
		});
	}

    function swapElement(array, indexA, indexB) {
        var tmp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = tmp;
    }

	/**
	 * Returns the content window for the given target frame.
	 *
	 * @param id    id of the target frame
	 */
	function getTargetWindow(id)
	{
		var frame = document.getElementById(id);
		var targetWindow = frame;

		if (frame.contentWindow)
		{
			targetWindow = frame.contentWindow;
		}

		return targetWindow;
	}

	/**
	 * Returns the content document for the given target frame.
	 *
	 * @param id    id of the target frame
	 */
	function getTargetDocument(id)
	{
		var frame = document.getElementById(id);
		var targetDocument = frame.contentDocument;

		if (!targetDocument && frame.contentWindow)
		{
			targetDocument = frame.contentWindow.document;
		}

		return targetDocument;
	}

    function getLinkToPatientView(cancerStudyId, patientId) {
        return "case.do?cancer_study_id=" + cancerStudyId + "&case_id=" + patientId;
    }
    
    function getLinkToSampleView(cancerStudyId, sampleId) {
        return "case.do?cancer_study_id=" + cancerStudyId + "&sample_id=" + sampleId;
    }

    return {
        toPrecision: toPrecision,
        getObjectLength: getObjectLength,
        checkNullOrUndefined: checkNullOrUndefined,
        uniqueElementsOfArray: uniqueElementsOfArray,
        arrayToAssociatedArrayIndices: arrayToAssociatedArrayIndices,
        alterAxesAttrForPDFConverter: alterAxesAttrForPDFConverter,
        lcss: lcss,
	    b64ToByteArrays: b64ToByteArrays,
        browser: detectBrowser(), // returning the browser object, not the function itself
        getWindowOrigin: getOrigin,
        sortByAttribute: sortByAttribute,
        safeProperty: safeProperty,
        autoHideOnMouseLeave: autoHideOnMouseLeave,
        swapElement: swapElement,
	    getTargetWindow: getTargetWindow,
	    getTargetDocument: getTargetDocument,
        getLinkToPatientView: getLinkToPatientView,
        getLinkToSampleView: getLinkToSampleView,
      deepCopyObject:deepCopyObject,
      makeCachedPromiseFunction: makeCachedPromiseFunction
    };

})();

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        if (typeof fun !== "function") {
            throw new TypeError();
        }

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                fun.call(thisp, this[i], i, this);
            }
        }
    };
}

/**
 * Singleton utility class for download related tasks.
 *
 * @author Selcuk Onur Sumer
 */
window.cbio.download = (function() {

  // Default client-side download options
  var _defaultOpts = {
    filename: "download.svg", // download file name
    contentType: "application/svg+xml", // download data type,
    dataType: null,      // servlet data type
    servletName: null,   // name of the data/conversion servlet (optional)
    servletParams: null, // servlet parameters (optional)
    preProcess: addSvgHeader,   // pre-process function for the provided data
    postProcess: cbio.util.b64ToByteArrays // post-process function for the data returned by the server (optional)
  };

  /**
   * Submits the download form.
   * This will send a request to the server.
   *
   * @param servletName       name of the action servlet
   * @param servletParams     params to send with the form submit
   * @param form              jQuery selector for the download form
   * @deprecated use either initDownload or clientSideDownload
   */
  function submitDownload(servletName, servletParams, form)
  {
    // remove all previous input fields (if any)
    $(form).find("input").remove();

    // add new input fields
    for (var name in servletParams)
    {
      var value = servletParams[name];
      $(form).append('<input type="hidden" name="' + name + '">');
      $(form).find('input[name="' + name + '"]').val(value);
    }

    // update target servlet for the action
    $(form).attr("action", servletName);
    // submit the form
    $(form).submit();
  }

  /**
   * Sends a download request to the hidden frame dedicated to file download.
   *
   * This function is implemented as a workaround to prevent JSmol crash
   * due to window.location change after a download request.
   *
   * @param servletName
   * @param servletParams
   * @deprecated use either initDownload or clientSideDownload
   */
  function requestDownload(servletName, servletParams)
  {
    // TODO this is a workaround, frame download doesn't work for IE
    if (cbio.util.browser.msie)
    {
      initDownloadForm();
      submitDownload(servletName, servletParams, "#global_file_download_form");
      return;
    }

    initDownloadFrame(function() {
      var targetWindow = cbio.util.getTargetWindow("global_file_download_frame");

      targetWindow.postMessage(
        {servletName: servletName,
          servletParams: servletParams},
        getOrigin());
    });
  }

  /**
   * Initializes the hidden download frame for the entire document.
   * This is to isolate download requests from the main window.
   *
   * @deprecated use either initDownload or clientSideDownload
   */
  function initDownloadFrame(callback)
  {
    var frame = '<iframe id="global_file_download_frame" ' +
      'src="file_download_frame.jsp" ' +
      'seamless="seamless" width="0" height="0" ' +
      'frameBorder="0" scrolling="no">' +
      '</iframe>';

    // only initialize if the frame doesn't exist
    if ($("#global_file_download_frame").length === 0)
    {
      $(document.body).append(frame);

      // TODO a workaround to enable target frame to get ready to listen messages
      setTimeout(callback, 500);
    }
    else
    {
      callback();
    }
  }

  /**
   * This form is initialized only for IE
   *
   * @deprecated use either initDownload or clientSideDownload
   */
  function initDownloadForm()
  {
    var form = '<form id="global_file_download_form"' +
      'style="display:inline-block"' +
      'action="" method="post" target="_blank">' +
      '</form>';

    // only initialize if the form doesn't exist
    if ($("#global_file_download_form").length === 0)
    {
      $(document.body).append(form);
    }
  }

  /**
   * Initiates a client side download for the given content array.
   *
   * @param content   data array to download
   * @param filename  download file name
   * @param type      download type
   */
  function clientSideDownload(content, filename, type)
  {
    if (type == null)
    {
      // text by default
      type = "text/plain;charset=utf-8"
    }

    if (filename == null)
    {
      filename = "download.txt";
    }

    var blob = new Blob(content, {type: type});

    saveAs(blob, filename);
  }

  /**
   * Serializes the given html element into a string.
   *
   * @param element       html element
   * @returns {string}    serialized string
   */
  function serializeHtml(element)
  {
    // convert html element to string
    var xmlSerializer = new XMLSerializer();
    return xmlSerializer.serializeToString(element);
  }

  /**
   * Adds missing xml and svg headers to the provided svg string
   *
   * @param xml   xml as a string
   * @returns {string}    new xml string with additional headers
   */
  function addSvgHeader(xml)
  {
    var svg = xml;

    var xmlHeader = "<?xml version='1.0'?>";
    var xmlVersion = "<?xml version=";

    // add xml header if not exist
    if(svg.indexOf(xmlVersion) == -1)
    {
      svg = xmlHeader + xml;
    }

    // add svg header if not exist
    if(svg.indexOf("svg xmlns") == -1)
    {
      svg = svg.replace(
        "<svg", "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'");
    }

    return svg;
  }

  /**
   * Initializes a client side download for the given content.
   *
   * @param content   data content, either string or DOM element
   * @param options   download options (see _defaultOpts)
   */
  function initDownload(content, options)
  {
    options = jQuery.extend(true, {}, _defaultOpts, options);

    // try to serialize only if content is not string...
    if (!_.isString(content))
    {
      content = serializeHtml(content);
    }

    if (_.isFunction(options.preProcess))
    {
      content = options.preProcess(content);
    }

    if (options.contentType.toLowerCase().indexOf("pdf") != -1)
    {
      // if no servlet params provided, use default ones for pdf...
      options.servletParams = options.servletParams || {
          filetype: "pdf_data",
          svgelement: content
        };
    } else if (options.contentType.toLowerCase().indexOf("png") != -1)
    {
      options.servletParams = options.servletParams || {
          filetype: "png_data",
          svgelement: content
        };
    }


    // check if a servlet name provided
    if (options.servletName != null)
    {
      $.ajax({url: options.servletName,
        type: "POST",
        data: options.servletParams,
        dataType: options.dataType,
        success: function(servletData){
          var downloadData = servletData;

          if (_.isFunction(options.postProcess))
          {
            downloadData = options.postProcess(servletData);
          }

          clientSideDownload(downloadData, options.filename, options.contentType);
        }
      });
    }
    else
    {
      clientSideDownload([content], options.filename, options.contentType);
    }
  }

  return {
    submitDownload: submitDownload,
    requestDownload: requestDownload,
    clientSideDownload: clientSideDownload,
    initDownload: initDownload,
    serializeHtml: serializeHtml,
    addSvgHeader: addSvgHeader
  };
})();

// http://bootstrap-notify.remabledesigns.com/
function Notification() {

    // default settings
    var settings = {
        message_type: "success", //success, warning, danger, info
        allow_dismiss: false,
        newest_on_top: false,
        placement_from: "top",
        placement_align: "right",
        spacing: 10,
        delay: 5000,
        timer: 1000,
        custom_class:"geneAddedNotification"
    };

    // create a notification
    this.createNotification = function(notificationMessage, options) {
        //if the options isn’t null extend defaults with user options.
        if (options) $.extend(settings, options);

        // create the notification
        $.notify({
            message: notificationMessage,
        }, {
            // settings
            element: 'body',
            type: settings.message_type,
            allow_dismiss: settings.allow_dismiss,
            newest_on_top: settings.newest_on_top,
            showProgressbar: false,
            placement: {
                from: settings.placement_from,
                align: settings.placement_align
            },
            spacing: settings.spacing,
            z_index: 1031,
            delay: settings.delay,
            timer: settings.timer,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} '+settings.custom_class+'" role="alert">' +
            '<button type="button" style="display: none" aria-hidden="true" class="close" data-notify="dismiss" >×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>'
        });


    }
}
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// based on gene-symbol-validator.js
//function GeneValidator(geneAreaId, emptyAreaMessage, updateGeneCallback){
function GeneValidator(geneAreaId, geneModel){
    var self = this;
    var nrOfNotifications=0;

    var showNotification=true;

    this.init = function(){
        console.log(new Date() + " init called for "+geneAreaId);
        // create a debounced validator
        var debouncedValidation = _.debounce(this.validateGenes, 1000);
        $(geneAreaId).bind('input propertychange', debouncedValidation);
    }

    this.validateGenes = function(callback, show){
        console.log(new Date() + " validating genes in "+geneAreaId);

        // store whether to show notifications
        showNotification=(show===undefined)?true:show;

        // clear all existing notifications
        if(showNotification) clearAllNotifications();

        // clean the textArea string, removing doubles and non-word characters (except -)
        var genesStr = geneModel.getCleanGeneString(",");

        var genes = [];
        var allValid = true;

        $.post('http://www.cbioportal.org/CheckGeneSymbol.json', { 'genes': genesStr })
            .done(function(symbolResults) {
                // If the number of genes is more than 100, show an error
                if(symbolResults.length > 100) {
                    addNotification("<b>You have entered more than 100 genes.</b><br>Please enter fewer genes for better performance", "danger");
                    allValid=false;
                }

                // handle each symbol found
                for(var j=0; j < symbolResults.length; j++) {
                    var valid = handleSymbol(symbolResults[j])
                    if(!valid) {
                        allValid = false;
                    }
                }
            })
            .fail(function(xhr,  textStatus, errorThrown){
                addNotification("There was a problem: "+errorThrown, "danger");
                allValid=false;
            })
            .always(function(){
                // if not all valid, focus on the gene array for focusin trigger
                if(!allValid) $(geneAreaId).focus();
                // in case a submit was pressed, use the callback
                if($.isFunction(callback)) callback(allValid);
            });
    }

    // return whether there are any active notifications
    this.noActiveNotifications = function(){
        return nrOfNotifications===0;
    }

    this.replaceAreaValue = function(geneName, newValue){
        var regexp = new RegExp("\\b"+geneName+"\\b","g");
        var genesStr = geneModel.getCleanGeneString();
        geneModel.set("geneString", genesStr.replace(regexp, newValue).trim());
    }

    // create a notification of a certain type
    function addNotification(message, message_type){
        notificationSettings.message_type = message_type;
        new Notification().createNotification(message, notificationSettings);
        nrOfNotifications = $(".alert").length;
    }

    function clearAllNotifications(){
        // select the notifications of interest
        // kill their animations to prevent them from blocking space, destroy any qtips remaining and call click to
        // make the notifications disappear
        $(".geneValidationNotification").css("animation-iteration-count", "0");
        $(".geneValidationNotification").qtip("destroy");
        $(".geneValidationNotification").find("button").click();
        nrOfNotifications=0;
    }

    // handle one symbol
    function handleSymbol(aResult){
        var valid = false;

        // 1 symbol
        if(aResult.symbols.length == 1) {
            if(aResult.symbols[0].toUpperCase() != aResult.name.toUpperCase() && showNotification)
                handleSynonyms(aResult);
            else
                valid=true;
        }
        else if(aResult.symbols.length > 1 && showNotification)
            handleMultiple(aResult)
        else if(showNotification)
            handleSymbolNotFound(aResult);

        return valid;
    }

    // case where we're dealing with an ambiguous gene symbol
    function handleMultiple(aResult){
        var gene = aResult.name;
        var symbols = aResult.symbols;

        var tipText = "Ambiguous gene symbol. Click on one of the alternatives to replace it.";
        var notificationHTML="<span>Ambiguous gene symbol - "+gene+" ";

        // create the dropdown
        var nameSelect = $("<select id="+gene+">").addClass("geneSelectBox").attr("name", gene);
        $("<option>").attr("value", "").html("select a symbol").appendTo(nameSelect);
        for(var k=0; k < symbols.length; k++) {
            var aSymbol = symbols[k];
            // add class and data-notify to allow us to dismiss the notification
            var anOption = $("<option class='close' data-notify='dismiss'>").attr("value", aSymbol).html(aSymbol);
            anOption.appendTo(nameSelect);
        }

        notificationHTML+=nameSelect.prop('outerHTML')+"</span>";
        addNotification(notificationHTML, "warning");

        // when the dropdown is changed
        $("#"+gene).change(function() {
            nrOfNotifications--;
            // replace the value in the text area
            self.replaceAreaValue($(this).attr("name"), $(this).attr("value"));

            // destroy the qtip if it's still there
            $(this).qtip("destroy");

            // emulate a click on the selected child to dismiss the notification
            this.children[this.selectedIndex].click();
        });

        addQtip(gene, tipText);
    }


    // case when the symbol has synonyms
    function handleSynonyms(aResult){
        var gene = aResult.name;
        var trueSymbol = aResult.symbols[0];
        var tipText = "'" + gene + "' is a synonym for '" + trueSymbol + "'. "
            + "Click here to replace it with the official symbol.";

        var notificationHTML=$("<span>Symbol synonym found - "+gene + ":" + trueSymbol+"</span>");
        notificationHTML.attr({
                'id': gene,
                'symbol': trueSymbol,
                'class':'close',
                'data-notify':'dismiss'
            });

        addNotification(notificationHTML.prop('outerHTML'), "warning");

        // add click event to our span
        // due to the class and data-notify, the click also removes the notification
        $("#"+gene).click(function(){
            nrOfNotifications--;
            // replace the value in the text area
            self.replaceAreaValue($(this).attr("id"), $(this).attr("symbol"));

            // destroy the qtip if it's still here
            $(this).qtip("destroy");
        });

        addQtip(gene, tipText);
    }

    // case when the symbol was not found
    function handleSymbolNotFound(aResult){
        var gene = aResult.name;
        var tipText = "Could not find gene symbol "+gene+". Click to remove it from the gene list.";

        var notificationHTML=$("<span>Symbol not found - "+gene+"</span>");
        notificationHTML.attr({
            'id': gene,
            'class':'close',
            'data-notify':'dismiss'
        });

        addNotification(notificationHTML.prop('outerHTML'), "warning");

        // add click event to our span
        // due to the class and data-notify, the click also removes the notification
        $("#"+gene).click(function(){
            nrOfNotifications--;
            // replace the value in the text area
            self.replaceAreaValue($(this).attr("id"), "");

            // destroy the qtip if it's still here
            $(this).qtip("destroy");
        });

        addQtip(gene, tipText);
    }

    // add a qtip to some identifier
    function addQtip(id, tipText){
        $("#"+id).qtip({
            content: {text: tipText},
            position: {my: 'top center', at: 'bottom center', viewport: $(window)},
            style: {classes: 'qtip-light qtip-rounded qtip-shadow'},
            show: {event: "mouseover"},
            hide: {fixed: true, delay: 100, event: "mouseout"}
        });
    }


    // notification settings
    var notificationSettings = {
        message_type: "warning",
        custom_class: "geneValidationNotification",
        allow_dismiss: true,
        spacing: 10,
        delay: 0,
        timer: 0
    };

    // when new object is created, called init();
    this.init();
}
function QueryByGeneUtil() {

    // add the field
    function addFormField(formId, itemName, itemValue) {
        $('<input>').attr({
            type: 'hidden',
            value: itemValue,
            name: itemName
        }).appendTo(formId)
    }

    // fields required for the study-view and their defaults to be able to query
    this.addStudyViewFields = function (cancerStudyId, mutationProfileId, cnaProfileId) {
        var formId = "#iviz-form";
        addFormField(formId, "gene_set_choice", "user-defined-list");
        addFormField(formId, "gene_list", QueryByGeneTextArea.getGenes());

        addFormField(formId, "cancer_study_list", cancerStudyId);
        addFormField(formId, "Z_SCORE_THRESHOLD", 2.0);
        addFormField(formId, "genetic_profile_ids_PROFILE_MUTATION_EXTENDED", mutationProfileId);
        addFormField(formId, "genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION", cnaProfileId);
        addFormField(formId, "clinical_param_selection", null);
        addFormField(formId, "data_priority", 0);
        addFormField(formId, "tab_index", "tab_visualize");
        addFormField(formId, "Action", "Submit");
    }
}


var GenelistModel = Backbone.Model.extend({
    defaults: {
        geneString: ""
    },

    isEmptyModel: function(){
       return this.get("geneString").length==0;
    },

    getCleanGeneString: function(delim){
        delim = delim || " ";
        return this.getCleanGeneArray().join(delim);
    },

    getCleanGeneArray: function(){
        return $.unique(this.removeEmptyElements(this.get("geneString").toUpperCase().split(/[^a-zA-Z0-9-]/))).reverse();
    },

    removeEmptyElements: function (array){
        return array.filter(function(el){ return el !== "" });
    }
});

var QueryByGeneTextArea  = (function() {
    var geneModel = new GenelistModel();
    var areaId;
    var updateGeneCallBack;
    var geneValidator;
    var emptyAreaText = "query genes - click to expand";

    // when the textarea does not have focus, the text shown in the (smaller) textarea
    // is gene1, gene2 and x more
    function createFocusOutText(){
        var geneList = geneModel.getCleanGeneArray();
        var focusOutText = geneList[0];
        var stringLength = focusOutText.length;

        // build the string to be shown
        for(var i=1; i<geneList.length; i++){
            stringLength+=geneList[i].length+2;
            // if the string length is bigger than 15 characters add the "and x more"
            if(stringLength>15) {
                focusOutText+= " and "+(geneList.length-i)+" more";
                break;
            }
            focusOutText+=", "+geneList[i];
        }
        return focusOutText;
    }

    // set the textarea text when focus is lost (and no notifications are open)
    function setFocusOutText(){
        var focusOutText=emptyAreaText;
        // if there are genes build the focusText
        if(!geneModel.isEmptyModel()) focusOutText = createFocusOutText();
        setFocusoutColour();
        $(areaId).val(focusOutText);
    }

    // if the geneList is empty, we use a gray colour, otherwise black
    function setFocusoutColour(){
        if(!geneModel.isEmptyModel()) $(areaId).css("color", "black");
        else $(areaId).css("color", "darkgrey");
    }

    // when the textarea has focus, the contents is the geneList's contents separated by spaces
    function setFocusInText(){
        $(areaId).css("color", "black");
        $(areaId).val(geneModel.getCleanGeneString());
    }

    function isEmpty(){
        return geneModel.isEmptyModel();
    }

    function getGenes(){
        return geneModel.getCleanGeneString();
    }

    // addRemoveGene is used when someone clicks on a gene in a table (StudyViewInitTables)
    function addRemoveGene (gene){
        var geneList = geneModel.getCleanGeneArray();

        // if the gene is not yet in the list, add it and create a notification
        if(geneList.indexOf(gene)==-1) {
            geneList.push(gene);
            geneModel.set("geneString", geneModel.getCleanGeneString()+" "+gene);
            new Notification().createNotification(gene+" added to your query");
        }
        // if the gene is in the list, remove it and create a notification
        else{
            var index = geneList.indexOf(gene);
            geneList.splice(index, 1);
            geneModel.set("geneString", geneList.join(" "));
            new Notification().createNotification(gene+" removed from your query");
        }
        // if there are active notifications, the textarea is still expanded and the contents
        // should reflect this
        if(geneValidator.noActiveNotifications()) setFocusOutText();
        else setFocusInText();

        // update the highlighting in the tables
        //if(updateGeneCallBack != undefined) updateGeneCallBack(geneList);
    }

    // used by the focusOut event and by the updateTextArea
    function setFocusOut(){
        // if there are no active notifications and the textarea does not have focus
        if(geneValidator.noActiveNotifications() && !$(areaId).is(":focus")){
            // switch from focusIn to focusOut and set the focus out text
            $(areaId).switchClass("expandFocusIn", "expandFocusOut", 500);
            setFocusOutText();
        }

        // update the gene tables for highlighting
        if(updateGeneCallBack != undefined) updateGeneCallBack(geneModel.getCleanGeneArray());
    }

    function validateGenes(callback){
        geneValidator.validateGenes(callback, false);
    }

    function updateTextArea(){
        // set display text - this will not fire the input propertychange
        $(areaId).val(geneModel.get("geneString"));
        setFocusOut();
    }

    function updateModel(){
        // check whether the model actually has to be updated
        if(geneModel.get("geneString")!=$(areaId).val()) {
            geneModel.set("geneString", $(areaId).val());
        }
    }

    // initialise events
    function initEvents(){
        // when user types in the textarea, update the model
        $(areaId).bind('input propertychange', updateModel);

        // when the model is changed, update the textarea
        geneModel.on("change", updateTextArea);

        // add the focusin event
        $(areaId).focusin(function () {
            $(this).switchClass("expandFocusOut", "expandFocusIn", 500);
            setFocusInText();
        });

        // add the focusout event
        $(areaId).focusout(function () {
            setFocusOut();
        });

        // create the gene validator
        geneValidator = new GeneValidator(areaId, geneModel);
    }


    function init(areaIdP, updateGeneCallBackP){
        areaId = areaIdP;
        updateGeneCallBack = updateGeneCallBackP;
        setFocusOutText();
        initEvents();
    }

    return{
        init: init,
        addRemoveGene: addRemoveGene,
        getGenes: getGenes,
        isEmpty: isEmpty,
        validateGenes: validateGenes
    }

})();

