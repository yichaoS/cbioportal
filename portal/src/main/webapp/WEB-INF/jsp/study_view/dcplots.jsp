<%--
 - Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 -
 - This library is distributed in the hope that it will be useful, but WITHOUT
 - ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 - FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 - is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 - obligations to provide maintenance, support, updates, enhancements or
 - modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 - liable to any party for direct, indirect, special, incidental or
 - consequential damages, including lost profits, arising out of the use of this
 - software and its documentation, even if Memorial Sloan-Kettering Cancer
 - Center has been advised of the possibility of such damage.
 --%>

<%--
 - This file is part of cBioPortal.
 -
 - cBioPortal is free software: you can redistribute it and/or modify
 - it under the terms of the GNU Affero General Public License as
 - published by the Free Software Foundation, either version 3 of the
 - License.
 -
 - This program is distributed in the hope that it will be useful,
 - but WITHOUT ANY WARRANTY; without even the implied warranty of
 - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 - GNU Affero General Public License for more details.
 -
 - You should have received a copy of the GNU Affero General Public License
 - along with this program.  If not, see <http://www.gnu.org/licenses/>.
--%>

<%@ page import="org.mskcc.cbio.portal.servlet.MutationsJSON" %>
<%@ page import="org.mskcc.cbio.portal.servlet.CnaJSON" %>
<%@ page import="org.mskcc.cbio.portal.servlet.PatientView" %>
<%@ page import="org.mskcc.cbio.portal.util.GlobalProperties" %>

<script src="js/lib/jquery.min.js"></script>
<script src="js/lib/jquery.tipTip.minified.js"></script>
<script src="js/lib/mailme.js"></script>
<script src="js/lib/d3.v3.min.js"></script>
<script src="js/lib/jquery-ui.min.js"></script>

<!-- build:js(.) scripts/vendor.js -->
<!-- bower:js -->
<script src="js/bower_components/modernizr/modernizr.js"></script>
<script src="js/bower_components/chosen/chosen.jquery.min.js"></script>
<script src="js/bower_components/datatables/media/js/jquery.dataTables.js"></script>
<script src="js/bower_components/crossfilter2/crossfilter.js"></script>
<script src="js/bower_components/dcjs/dc.js"></script>
<script src="js/bower_components/classie/classie.js"></script>
<script src="js/bower_components/get-style-property/get-style-property.js"></script>
<script src="js/bower_components/get-size/get-size.js"></script>
<script src="js/bower_components/eventie/eventie.js"></script>
<script src="js/bower_components/eventEmitter/EventEmitter.js"></script>
<script src="js/bower_components/unipointer/unipointer.js"></script>
<script src="js/bower_components/unidragger/unidragger.js"></script>
<script src="js/bower_components/draggabilly/draggabilly.js"></script>
<script src="js/bower_components/doc-ready/doc-ready.js"></script>
<script src="js/bower_components/matches-selector/matches-selector.js"></script>
<script src="js/bower_components/fizzy-ui-utils/utils.js"></script>
<script src="js/bower_components/outlayer/item.js"></script>
<script src="js/bower_components/outlayer/outlayer.js"></script>
<script src="js/bower_components/packery/dist/packery.pkgd.js"></script>
<script src="js/bower_components/underscore/underscore.js"></script>
<script src="js/bower_components/ev-emitter/ev-emitter.js"></script>
<script src="js/bower_components/imagesloaded/imagesloaded.js"></script>
<script src="js/bower_components/qtip2/jquery.qtip.js"></script>
<script src="js/bower_components/qtip2/basic/jquery.qtip.js"></script>
<script src="js/bower_components/vue/dist/vue.js"></script>
<script src="js/bower_components/notifyjs/dist/notify.js"></script>
<script src="js/bower_components/clipboard/dist/clipboard.js"></script>
<script src="js/bower_components/plotly.js/dist/plotly.min.js"></script>
<script src="js/bower_components/react/react.js"></script>
<script src="js/bower_components/react/react-dom.js"></script>
<!-- endbower -->
<!-- endbuild -->

<!-- build:css(.) styles/vendor.css -->
<!-- bower:css -->
<link rel="stylesheet" href="js/bower_components/chosen/chosen.min.css" />
<link rel="stylesheet" href="js/bower_components/datatables/media/css/jquery.dataTables.css" />
<link rel="stylesheet" href="js/bower_components/dcjs/dc.css" />
<link rel="stylesheet" href="js/bower_components/qtip2/jquery.qtip.css" />
<link rel="stylesheet" href="js/bower_components/components-font-awesome/css/font-awesome.css" />
<link rel="stylesheet" href="js/bower_components/fixed-data-table/dist/fixed-data-table.min.css" />
<!-- endbower -->
<!-- endbuild -->



