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

<%@ page import="org.apache.commons.lang.StringEscapeUtils" %>
<%@ page import="org.json.simple.JSONValue" %>
<%@ page import="org.mskcc.cbio.portal.model.CancerStudy" %>
<%@ page import="org.mskcc.cbio.portal.model.GeneticProfile" %>
<%@ page import="org.mskcc.cbio.portal.servlet.*" %>
<%@ page import="java.util.List" %>

<%
request.setAttribute("standard-js-css", true);
String isDemoMode = request.getParameter("demo");
boolean showPlaceHoder;
if (isDemoMode!=null) {
    showPlaceHoder = isDemoMode.equalsIgnoreCase("on");
} else {
    showPlaceHoder = GlobalProperties.showPlaceholderInPatientView();
}

CancerStudy cancerStudy = (CancerStudy)request.getAttribute(CancerStudyView.CANCER_STUDY);
String cancerStudyViewError = (String)request.getAttribute(CancerStudyView.ERROR);

if (cancerStudyViewError!=null) {
    out.print(cancerStudyViewError);
} else {
%>

<jsp:include page="../global/header.jsp" flush="true" />

<table width="100%">
    <tr>
        <td>
            <form method="post" action="index.do">
            <span id="study_name"></span>
                <input type="hidden" id="cancer_study_id" name="cancer_study_id">
                <input type="hidden" id="cancer_study_list">
                <input type="submit" value="Query this study" class="btn btn-primary btn-xs">
            </form>
        </td>
    </tr>
    <tr>
        <td id="study_desc">
        </td>
    </tr>
</table>


<div id="study-tabs">
    <ul>
        
    <li id="li-1"><a href='#summary' id='study-tab-summary-a' class='study-tab' title='Study Summary'>Study Summary</a></li>
    <!--<li><a href='#clinical-plots' class='study-tab' title='DC Plots'>Study Summary</a></li>-->
    <li><a href='#clinical' id='study-tab-clinical-a' class='study-tab' title='Clinical Data'>Clinical Data</a></li>
    
    </ul>
    
    <div class="study-section" id="summary">
        <%@ include file="dcplots.jsp" %>
    </div>
    
    <div class="study-section" id="clinical">
        <%@ include file="clinical.jsp" %>
    </div>
    
    <div class="study-section" id="mutations" style="display:none;">
        <%@ include file="mutations.jsp" %>
    </div>

    <div class="study-section" id="cna"  style="display:none;">
        <%@ include file="cna.jsp" %>
    </div>

</div>
<%  
}
%>
        </div>
    </td>
</tr>

<tr>
    <td colspan="3">
    <jsp:include page="../global/footer.jsp" flush="true" />
    </td>
</tr>

</table>
</center>
</div>
<span id="ruler"></span>
<jsp:include page="../global/xdebug.jsp" flush="true" />    

<style type="text/css">
        @import "css/data_table_jui.css?<%=GlobalProperties.getAppVersion()%>";
        @import "css/data_table_ColVis.css?<%=GlobalProperties.getAppVersion()%>";
        @import "css/bootstrap-chzn.css?<%=GlobalProperties.getAppVersion()%>";
        .ColVis {
                float: left;
                margin-bottom: 0
        }
        .dataTables_length {
                width: auto;
                float: right;
        }
        .dataTables_info {
                clear: none;
                width: auto;
                float: right;
        }
        .dataTables_filter {
                width: 40%;
        }
        .div.datatable-paging {
                width: auto;
                float: right;
        }
        .data-table-name {
                float: left;
                font-weight: bold;
                font-size: 120%;
                vertical-align: middle;
        }
</style>

<script src="js/src/dashboard/iviz-vendor.js"></script>
<script src="js/src/dashboard/iviz.js"></script>
<script src="js/src/dashboard/cbio-vendor.js"></script>
<script src="js/src/dashboard/vc-session.js"></script>
<script src="js/src/dashboard/model/dataProxy.js"></script>
<script src="js/api/cbioportal-client.js"></script>

<script src="js/lib/jquery.tipTip.minified.js"></script>
<script src="js/lib/mailme.js"></script>
<script src="js/lib/jquery-ui.min.js"></script>
<script src="js/lib/FileSaver.min.js"></script>
<script src="js/lib/bootstrap-dropdown-checkbox.js"></script>
<script src="js/lib/ZeroClipboard.js"></script>
<script src="js/lib/EnhancedFixedDatatable.js"></script>

<link rel="stylesheet" href="css/bootstrap-dropdown-checkbox.css"/>
<link rel="stylesheet" href="css/fixed-data-table.min.css"/>
<link rel="stylesheet" href="css/study-view.css"/>
<link rel="stylesheet" href="css/vc-session.css"/>
<link rel="stylesheet" href="css/dashboard/iviz-vendor.css"/>
<link rel="stylesheet" href="css/dashboard/iviz.css"/>

<script src="js/src/dashboard/model/StudyViewProxy.js"></script>
<script src="js/src/dashboard/controller/StudyViewParams.js"></script>ipt>
<script src="js/src/dashboard/controller/StudyViewClinicalTabController.js"></script>
<script src="js/src/dashboard/controller/StudyViewMutationsTabController.js"></script>
<script src="js/src/dashboard/controller/StudyViewCNATabController.js"></script>
<script src="js/src/dashboard/view/StudyViewInitClinicalTab.js"></script>
<script src="js/src/dashboard/view/StudyViewInitMutationsTab.js"></script>
<script src="js/src/dashboard/view/StudyViewInitCNATab.js"></script>

<script type="text/javascript">
var cancerStudyId = '<%=cancerStudy.getCancerStudyStableId()%>';
var cancer_study_id = cancerStudyId; //Some components using this as global ID
var appVersion = '<%=GlobalProperties.getAppVersion()%>';

var hasMutation = false;
var hasCnaSegmentData = false;
var cnaProfileId = '';
var mutationProfileId = '';
$(document).ready(function () {
    var appendMutationTab = function(){
    	hasMutation = true;
        $("#study-tabs ul").append("<li><a href='#mutations' id='study-tab-mutations-a' class='study-tab' title='Mutations'>Mutated Genes</a></li>");
        $('#study-tabs > #mutations').css('display','block');
        $('#study-tab-mutations-a').click(function(){
            if (!$(this).parent().hasClass('ui-state-disabled') && !$(this).hasClass("tab-clicked")) {
                StudyViewMutationsTabController.init(function() {
                    $(this).addClass("tab-clicked");
                    StudyViewMutationsTabController.getDataTable().fnAdjustColumnSizing();
                });
            }
            window.location.hash = '#mutations';
        });
    }
    var appendCnaTab = function(){
    	hasCnaSegmentData = true;
        $("#study-tabs ul").append("<li><a href='#cna' id='study-tab-cna-a' class='study-tab' title='Copy Number Alterations'>Copy Number Alterations</a></li>");
        $('#study-tabs > #cna').css('display','block');
        $('#study-tab-cna-a').click(function(){
            if (!$(this).parent().hasClass('ui-state-disabled') && !$(this).hasClass("tab-clicked")) {
                StudyViewCNATabController.init(function() {
                    $(this).addClass("tab-clicked");
                    StudyViewCNATabController.getDataTable().fnAdjustColumnSizing();
                });
            }
            window.location.hash = '#cna';
        });
    }
    // TODO: All temporory fixes, need to do the refacotoring with new iViz code
    $.when( window.cbioportal_client.getStudies({ study_id: [cancerStudyId]}), window.cbioportal_client.getGeneticProfiles({ study_id: [cancerStudyId]}))
    .then(function(_cancerStudy, _geneticProfiles){
        $("#study_name").html("<b><u>"+_cancerStudy[0].name+"</u></b>");
        $("#cancer_study_id").val(cancerStudyId);
        $("#cancer_study_list").val(cancerStudyId);
        var _desc = _cancerStudy[0].description
        if(_cancerStudy[0].pmid !== null){
            _desc += '<a href="http://www.ncbi.nlm.nih.gov/pubmed/'+_cancerStudy[0].pmid+'">PubMed</a>';
        }
        $("#study_desc").html(_desc);
        // TODO need to update this once latest iViz is merged. Since iViz datamanager has functions that directly gic
         var _mutationProfiles = _.filter(_geneticProfiles, function (_profile) {
             return _profile.study_id + '_mutations' === _profile.id;
         });
         if(_mutationProfiles.length>0){
             appendMutationTab();
         }
         var _cnaProfiles = _.filter(_geneticProfiles, function (_profile) {
             return _profile.study_id + '_gistic' === _profile.id;
         });
         if(_cnaProfiles.length>0){
             appendCnaTab();
         }
         
         $("#study-tabs").tabs({disabled: true});

         $('#study-tab-summary-a').click(function () {
             if (!$(this).parent().hasClass('ui-state-disabled') && !$(this).hasClass("tab-clicked")) {
                 if(_.isUndefined(window.iviz.datamanager)) {
                     window.iviz.datamanager = new iViz.data.init(window.cbioURL, window.studyCasesMap, initdcplots);
                     window.iviz.datamanager.initialSetup();
                 }else {
                     initdcplots(window.iviz.datamanager.initialSetupResult);
                 }
                 $('#study-tab-summary-a').addClass("tab-clicked");
             }
             window.location.hash = '#summary';
         });

         $('#study-tab-clinical-a').click(function(){
             if (!$(this).parent().hasClass('ui-state-disabled') && !$(this).hasClass("tab-clicked")) {
                 //First time: adjust the width of data table;
                 $("#clinical-data-table-loading-wait").css('display', 'inline-block');
                 $("#clinical-data-table-div").css('display','none');

                 if(_.isUndefined(window.iviz.datamanager)) {
                     window.iviz.datamanager = new iViz.data.init(window.cbioURL, window.studyCasesMap, function(a,b,c){
                         StudyViewClinicalTabController.init(function() {
                             $("#clinical-data-table-div").css('display','inline-block');
                             $("#clinical-data-table-loading-wait").css('display', 'none');
                             $('#study-tab-clinical-a').addClass("tab-clicked");
                         });
                     });
                     window.iviz.datamanager.initialSetup();
                 }else {
                     StudyViewClinicalTabController.init(function() {
                         $("#clinical-data-table-div").css('display','inline-block');
                         $("#clinical-data-table-loading-wait").css('display', 'none');
                         $('#study-tab-clinical-a').addClass("tab-clicked");
                     });
                 }
             }
             window.location.hash = '#clinical';
         });
         
         // TODO changed mutationProfileId to mutationProfileIds
         StudyViewParams.params = {
                    studyId: cancerStudyId,
                    mutationProfileId: _mutationProfiles[0].id,
                    hasMutSig: hasMutation
                };
                StudyViewProxy.ivizLoad();

                //Include style variables
                window.style = {
                    vars: {}
                };
                var _vm = iViz.vue.manage.getInstance();
                _vm.showSaveButton=false;
                _vm.showManageButton=false;
                $.get('js/src/dashboard/resources/vars.json')
                    .then(function (data) {
                        window.style.vars = data;
                        window.style.vars.survivalWidth = 320;
                        window.style.vars.survivalHeight = 320;
                        window.style.vars.barchartWidth = 350;
                        window.style.vars.barchartHeight = 120;
                    });
                //this is for testing, once done this should be commented/deleted
                //window.cbioURL = window.location.origin + '/dashboard';
                //commented for thesing
                window.cbioURL = window.location.origin + window.location.pathname.substring(0, window.location.pathname.indexOf("/",2));
                //window.mutationProfileId = window.mutationProfileId;
               // window.cnaProfileId = window.cnaProfileId;
               // window.case_set_id = window.caseSetId;
                window.studyCasesMap = {};
                window.studyCasesMap[window.cancerStudyId]={};
                window.iviz = {};
                
                var urlHash = window.location.hash;
                for (var i = 0, tabsL = $('#study-tabs').find('li').length; i < tabsL; i++) {
                    $('#study-tabs').tabs('enable', i);
                }

                if (!_.isUndefined(urlHash)) {
                    switch (urlHash) {
                        case '#cna':
                            if ($('#study-tab-cna-a').length == 0) {
                                $('#study-tab-summary-a').click();
                            } else {
                                $('#study-tab-cna-a').click();
                            }
                            break;
                        case '#mutations':
                            if ($('#study-tab-mutations-a').length == 0) {
                                $('#study-tab-summary-a').click();
                            } else {
                                $('#study-tab-mutations-a').click();
                            }
                            break;
                        case '#clinical':
                            if ($('#study-tab-clinical-a').length == 0) {
                                $('#study-tab-summary-a').click();
                            } else {
                                $('#study-tab-clinical-a').click();
                            }
                            break;
                        case '#summary':
                            $('#study-tab-summary-a').click();
                            break;
                        default:
                            $('#study-tab-summary-a').click();
                            break;

                    }
                } else {
                    $('#study-tab-summary-a').click();
                }
    })
    
});
</script>

</body>
</html>
