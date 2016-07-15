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

<script src="js/src/dashboard/iviz-vendor.js"></script>
<script src="js/src/dashboard/iviz.js"></script>
<script src="js/src/dashboard/iviz-session.js"></script>
<script src="js/src/dashboard/model/dataProxy.js"></script>

<script src="https://rawgit.com/notifyjs/notifyjs/master/dist/notify.js"></script>
<script src="js/lib/jquery.tipTip.minified.js"></script>
<script src="js/lib/mailme.js"></script>
<script src="js/lib/jquery-ui.min.js"></script>

<link rel="stylesheet" href="css/dashboard/iviz-vendor.css"/>
<link rel="stylesheet" href="css/dashboard/iviz.css"/>


<style>
    #complete-screen .grid {
        top: 30px;
    }
</style>

<div class="container-fluid" id="complete-screen">
    <%--<nav class="navbar navbar-default navbar-fixed-top">--%>
        <div id="main-header">
            <button type='button' class='btn btn-default'
            @click="addNewVC = true"
            id="save_cohort_btn">Save
            Cohort
            </button>
            <!--<button type='button' class="btn btn-default"-->
            <!--@click="showVCList = true">-->
            <!--<i class="fa fa-bars"></i>-->
            <!--</button>-->
            <div id="study-view-header-left">
                <span id="stat">
                  Samples Selected <mark>{{ selectedSamplesNum }}</mark> &nbsp;&nbsp;
                  Patients Selected <mark>{{ selectedPatientsNum }}</mark> &nbsp;&nbsp; &nbsp;&nbsp;
                </span>
                <span id="query-by-gene-span">
                   <span id="queryByGeneTextSpan"></span>
                   <textarea id="query-by-gene-textarea" class="expand expandFocusOut" rows="1" cols="10"></textarea>
                </span>
            </div>
            
            <div id="study-view-header-right" style="margin-right:30px;">
                <custom-case-input></custom-case-input>
                <!--<add-vc :add-new-vc.sync="addNewVC"  :from-iViz="true"-->
                <!--:selected-samples-num="selectedSamplesNum"-->
                <!--:selected-patients-num="selectedPatientsNum"></add-vc>-->
                <select id="study-view-add-chart" class="chosen-select"
                        v-select :groups="groups">
                    <option id='' value="">Add Chart</option>
                    <!--<option v-for="attributes in groups[0].attributes"></option>-->
                    <option is="manage-charts" :data.sync="group"
                            v-for="(index,group) in groups" :parent="index"></option>
                </select>
            </div>

            <div id="breadcrumbs_container" v-if="hasfilters">
                <div style="float:left;">
                    <span class="breadcrumb_container">Your selections: </span>
                </div>
                <span class="breadcrumb_container" v-if="customfilter.patientIds.length>0||customfilter.sampleIds.length>0">
                  <span>{{customfilter.display_name}}</span>
                  <img class="breadcrumb_remove" src="images/dashboard/remove_breadcrumb_icon.png" @click="clearAll()">
                </span>
                <div style="float:left" v-for="group in groups">
                    <bread-crumb :attributes.sync="item"
                                 :filters.sync="item.filter" v-for="(index1, item) in group.attributes"
                                 v-if="item.filter.length>0"></bread-crumb>
                    <!--<div v-for="(index1, item) in group.attributes"
                         v-if="item.filter.length>0">
                      <bread-crumb :attributes.sync="item"
                                   :filters.sync="item.filter"></bread-crumb>
                    </div>-->
                </div>
                <div>
                    <button type='button' @click="clearAll()">Clear
                        All
                    </button>
                </div>
            </div>
            <!--<modaltemplate :show.sync="showVCList" size="modal-xlg">-->
            <!--<div slot="header">-->
            <!--<h4 class="modal-title">Virtual Cohorts</h4>-->
            <!--</div>-->
            <!--<div slot="body">-->
            <!--<table class="table table-bordered table-hover table-condensed">-->
            <!--<thead>-->
            <!--<tr style="font-weight: bold">-->
            <!--<td style="width:20%">Name</td>-->
            <!--<td style="width:40%">Description</td>-->
            <!--<td style="width:10%">Patients</td>-->
            <!--<td style="width:10%">Samples</td>-->
            <!--<td style="width:20%">Operations</td>-->
            <!--</tr>-->
            <!--</thead>-->
            <!--<tr is="editable-row" :data="virtualCohort" :showmodal.sync="showVCList" v-for="virtualCohort in virtualCohorts">-->
            <!--</tr>-->
            <!--</table>-->
            <!--</div>-->

            <!--<div slot="footer">-->
            <!--&lt;!&ndash;<button type="button" class="btn btn-default"&ndash;&gt;-->
            <!--&lt;!&ndash;onclick="window.location.href='/index.html'">Add new</button>&ndash;&gt;-->
            <!--</div>-->
            <!--</modaltemplate>-->
            
        </div>
    <%--</nav>--%>
    
    <div class="grid" id="main-grid" :class="{loading:isloading}">
        <main-template :groups.sync="groups" :redrawgroups.sync="redrawgroups"
                       :selectedpatients.sync="selectedpatients" :patientmap="patientmap" :samplemap="samplemap"
                       :selectedsamples.sync="selectedsamples"
                       :hasfilters.sync="hasfilters" :customfilter.sync="customfilter"></main-template>
    </div>

</div>

<script>
    $(document).ready(function () {

        //Include style variables
        window.style = {
            vars: {}
        };
        $.get('js/src/dashboard/resources/vars.json')
            .then(function (data) {
                window.style.vars = data;
                window.style.vars.survivalWidth = 320;
                window.style.vars.survivalHeight = 320;
                window.style.vars.barchartWidth = 350;
                window.style.vars.barchartHeight = 120;
            })

        URL = "http://localhost:8081/api/sessions/";
        var vcId_ = location.search.split('vc_id=')[1];
        iViz.session.manage.init();
        if (typeof vcId_ != 'undefined') {
            iViz.session.model.getVirtualCohortDetails(vcId_);
        } else {
            //iViz.init(["blca_tcga_pub"]);
        	var cancerStudyIds = [];
            var samples = []
            $.each(window.studySampleMap,function(cancerStudyId,sampleIds){
                cancerStudyIds.push(cancerStudyId);
                samples = samples.concat(sampleIds);
            })
            var cancerStudyIds = Object.keys(window.studySampleMap)
            iViz.data.init('http://localhost:8080/cbioportal',cancerStudyIds,iViz.init,samples);
        }
        
        QueryByGeneTextArea.init('#query-by-gene-textarea', function(genes) {
            iViz.vue.manage.getInstance().$broadcast('gene-list-updated',genes);
        });
    });
</script>
