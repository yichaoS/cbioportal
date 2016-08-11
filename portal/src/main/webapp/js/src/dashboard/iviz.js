/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

var iViz = (function (_, $) {

  var data_;
  var vm_;
  var grid_;
  var tableData_ = [];
  var groupFiltersMap_ = {};

  return {

    init: function (_rawDataJSON, _inputSampleList, _inputPatientList) {

      vm_ = iViz.vue.manage.getInstance();

      data_ = _rawDataJSON;

      if (_inputSampleList !== undefined && _inputPatientList !== undefined) {
        var _sampleData = _.filter(_data.groups.sample.data, function (_dataObj) {
          return $.inArray(_dataObj['sample_id'], _inputSampleList) !== -1
        });
        var _sampleDataIndices = {};
        for (var _i = 0; _i < _sampleData.length; _i++) {
          _sampleDataIndices[_sampleData[_i].sample_id] = _i;
        }
        var _patientData = _.filter(_data.groups.patient.data, function (_dataObj) {
          return $.inArray(_dataObj['patient_id'], _inputPatientList) !== -1
        });
        var _patientDataIndices = {};
        for (var _j = 0; _j < _patientData.length; _j++) {
          _patientDataIndices[_patientData[_j].patient_id] = _j;
        }

        data_.groups.patient.data = _patientData;
        data_.groups.sample.data = _sampleData;
        data_.groups.patient.data_indices.patient_id = _patientDataIndices;
        data_.groups.sample.data_indices.sample_id = _sampleDataIndices;
      }

      var _patientIds = _.keys(data_.groups.patient.data_indices.patient_id);
      var _sampleIds = _.keys(data_.groups.sample.data_indices.sample_id);

      var chartsCount = 0;
      var groupAttrs = [];
      var group = {};
      var charts = {};
      var groups = [];

      // group.data = data_.groups.patient.data;
      group.type = 'patient';
      group.id = vm_.groupCount;
      group.selectedcases = [];
      group.hasfilters = false;
      _.each(data_.groups.patient.attr_meta,function(attrData){
        attrData.group_type = group.type;
        if(attrData.view_type=='table'){
          tableData_[attrData.attr_id]=attrData['gene_list'];
          attrData.gene_list = undefined;
        }
        if(chartsCount<31){
          if(attrData.show){
            attrData.group_id = group.id;
            groupAttrs.push(attrData);
            chartsCount++;
          }
        }else{
          attrData.show = false;
        }
        charts[attrData.attr_id]=attrData;
      });
      group.attributes = groupAttrs;
      groups.push(group);

      chartsCount = 0;
      groupAttrs = [];
      group = {};
      vm_.groupCount = vm_.groupCount+1;
      //group.data = data_.groups.sample.data;
      group.type = 'sample';
      group.id = vm_.groupCount;
      group.selectedcases = [];
      group.hasfilters = false;
      _.each(data_.groups.sample.attr_meta,function(attrData){
        attrData.group_type = group.type;
        if(attrData.view_type=='table'){
          tableData_[attrData.attr_id]=attrData['gene_list'];
          attrData.gene_list = undefined;
        }
        if(chartsCount<31){
          if(attrData.show){
            attrData.group_id = group.id;
            groupAttrs.push(attrData);
            chartsCount++;
          }
        }else{
          attrData.show = false;
        }
        charts[attrData.attr_id]=attrData;
      });
      vm_.groupCount = vm_.groupCount+1;
      group.attributes = groupAttrs;
      groups.push(group);



      vm_.isloading = false;
      vm_.selectedsamples = _sampleIds;
      vm_.selectedpatients = _patientIds;
      // vm_.patientmap = data_.groups.group_mapping.patient.sample;
      // vm_.samplemap = data_.groups.group_mapping.sample.patient;
      vm_.groups = groups;
      vm_.charts = charts;


    }, // ---- close init function ----groups
    setGroupFilteredCases : function(groupId_, filters_){
      groupFiltersMap_[groupId_] = filters_;
    },
    getGroupFilteredCases : function(groupId_){
      return groupFiltersMap_[groupId_];
    },deleteGroupFilteredCases : function(groupId_){
      groupFiltersMap_[groupId_] = undefined;
    },
    getAttrData : function(type, attr){
      var _data = {};
      var toReturn_ = [];
      if(type === 'sample'){
        _data = data_.groups.sample.data;
      }else if(type === 'patient'){
        _data = data_.groups.patient.data;
      }
      if(attr !== undefined){
        _.each(_data,function(val){
          if(val[attr] !== undefined){
            toReturn_.push(val[attr]);
          }
        });
      }else{
        toReturn_ = _data
      }
      return toReturn_;
    },
    getTableData : function(attrId) {
      return tableData_[attrId];
    },
    getCompleteData : function(){
      return data_;
    },
    getCasesMap : function(type){
      if(type === 'sample'){
        return data_.groups.group_mapping.sample.patient;
      }else{
        return data_.groups.group_mapping.patient.sample;
      }
    },
    getCaseIndices : function(type){
      if(type === 'sample'){
        return data_.groups.sample.data_indices.sample_id;
      }else{
        return data_.groups.patient.data_indices.patient_id;
      }
    },
    openCases:function(){
      var studyId = '';
      var possible = true;
      var selectedCases_ = vm_.selectedpatients;
      var caseIndices_ =this.getCaseIndices('patient');
      var patientData_ = data_.groups.patient.data;

      $.each(selectedCases_,function(key,caseId){
        if(key === 0){
          studyId = patientData_[caseIndices_[caseId]]['study_id'];
        }else{
          if(studyId !== patientData_[caseIndices_[caseId]]['study_id']){
            possible = false;
            return false;
          }
        }
      });
      if(possible){
        var _selectedPatientIds = selectedCases_.sort();
        var _url =  window.cbioURL+"/case.do?cancer_study_id="+
          studyId+
          "&case_id="+_selectedPatientIds[0]+
          "#nav_case_ids="+_selectedPatientIds.join(",");
        window.open(_url);
      }else{
        new Notification().createNotification('This feature is not available to multiple studies for now!', {message_type: 'info'});
      }
    },
    downloadCaseData:function(){
      var content = '';
      var sampleIds_ = vm_.selectedsamples;
      var attr = {};

      attr['CANCER_TYPE_DETAILED']='Cancer Type Detailed';
      attr['CANCER_TYPE']='Cancer Type';
      attr['study_id']='Study ID';
      attr['patient_id']='Patient ID';
      attr['sample_id']='Sample ID';
      attr['mutated_genes']='With Mutation Data';
      attr['cna_details']='With CNA Data';

      var arr = [];
      var attrL = 0, arrL = 0;
      var strA = [];

      var sampleAttr_ = data_.groups.sample.attr_meta;
      var patientAttr_ = data_.groups.patient.attr_meta;

      _.each(sampleAttr_,function(_attr){
        if(attr[_attr.attr_id] === undefined && 'scatter_plot' !== _attr.view_type)
          attr[_attr.attr_id] = _attr.display_name
      });

      _.each(patientAttr_,function(_attr){
        if(attr[_attr.attr_id] === undefined && 'survival' !== _attr.view_type)
          attr[_attr.attr_id] = _attr.display_name
      });

      attrL = attr.length;
      _.each(attr,function(displayName,attrId){
        strA.push(displayName || 'Unknown');
      });
      content = strA.join('\t');
      strA.length =0;
      var sampleIndices_ = data_.groups.sample.data_indices.sample_id;
      var patienIndices_ = data_.groups.patient.data_indices.patient_id;
      var sampleData_ = data_.groups.sample.data;
      var patientData_ = data_.groups.patient.data;
      var samplePatientMapping = data_.groups.group_mapping.sample.patient;
      _.each(sampleIds_,function(sampleId){
        var temp = sampleData_[sampleIndices_[sampleId]];
        var temp1 = $.extend(true,temp,patientData_[patienIndices_[samplePatientMapping[sampleId][0]]]);
        arr.push(temp1);
      });

      arrL = arr.length;

      for (var i = 0; i < arrL; i++) {
        strA.length = 0;
        _.each(attr,function(displayName,attrId){
          if('cna_details' === attrId || 'mutated_genes' === attrId ){
            var temp = 'No';
            if(arr[i][attrId] !== undefined)
              temp = arr[i][attrId].length>0?'Yes':'No';
            strA.push(temp);
          }else{
            strA.push(arr[i][attrId]);
          }
        });
        content += '\r\n' + strA.join('\t');
      }

      var downloadOpts = {
        filename: "study_view_clinical_data.txt",
        contentType: "text/plain;charset=utf-8",
        preProcess: false
      };

      cbio.download.initDownload(content, downloadOpts);

    },
    submitForm : function(){
      var selectedCases_ = vm_.selectedsamples;
      var studyId_ = '';
      var possibleTOQuery = true;
      _.each(selectedCases_,function(_caseId,key){
        var index_ = data_.groups.sample.data_indices.sample_id[_caseId];
        if(key === 0){
          studyId_ = data_.groups.sample.data[index_]['study_id'];
        }else{
          if(studyId_ !== data_.groups.sample.data[index_]['study_id']){
            possibleTOQuery = false;
            return false;
          }
        }
      });
      if(possibleTOQuery){
        $("#iviz-form").get(0).setAttribute('action',window.cbioURL+'/index.do');
        $('<input>').attr({
          type: 'hidden',
          value: studyId_,
          name: 'cancer_study_id'
        }).appendTo("#iviz-form");

        $('<input>').attr({
          type: 'hidden',
          value: window.case_set_id,
          name: 'case_set_id'
        }).appendTo("#iviz-form");

        $('<input>').attr({
          type: 'hidden',
          value: selectedCases_.join(' '),
          name: 'case_ids'
        }).appendTo("#iviz-form");
        
        window.studyId = studyId_;
        if(!QueryByGeneTextArea.isEmpty()) {
          event.preventDefault();
          QueryByGeneTextArea.validateGenes(this.decideSubmit, false);
        }else{
          $("#iviz-form").trigger("submit");
        }
      }else{
        new Notification().createNotification('Querying multiple studies features is not yet ready!', {message_type: 'info'});
      }
    },
    decideSubmit:function(allValid){
      // if all genes are valid, submit, otherwise show a notification
      if(allValid){
        new QueryByGeneUtil().addStudyViewFields(window.studyId, window.mutationProfileId, window.cnaProfileId);
        $("#iviz-form").trigger("submit");
      }
      else {
        new Notification().createNotification("There were problems with the selected genes. Please fix.", {message_type: "danger"});
        $("#query-by-gene-textarea").focus();
      }
    },
    stat: function () {
      var _result = {};
      _result['filters'] = {};

      // extract and reformat selected cases
      var _selectedCases = [];

      _.each(vm_.selectedsamples, function (_selectedSample) {

        var _index = data_.groups.sample.data_indices.sample_id[_selectedSample];
        var _studyId = data_.groups.sample.data[_index]['study_id'];

        // extract study information
        if ($.inArray(_studyId, _.pluck(_selectedCases, 'studyID')) !== -1) {
          _.each(_selectedCases, function (_resultObj) {
            if (_resultObj['studyID'] === _studyId) {
              _resultObj['samples'].push(_selectedSample);
            }
          });
        } else {
          _selectedCases.push({'studyID': _studyId, 'samples': [_selectedSample]});
        }

        // map samples to patients
        _.each(_selectedCases, function (_resultObj) {
          _resultObj['patients'] = iViz.util.idMapping(data_.groups.group_mapping.sample.patient, _resultObj['samples']);
        });

      });
      _result.filters['patients'] = [];
      _result.filters['samples'] = [];
      _.each(vm_.groups, function (group) {
        if (group.type === 'patient') {
          var filters_ = []
          _.each(group.attributes, function (attributes) {
            if (attributes.filter.length > 0)
              filters_[attributes.attr_id] = attributes.filter;
          });
          var temp = $.extend(true, _result.filters['patients'], filters_);
          var array = $.extend(true, {}, temp)
          _result.filters['patients'] = array;
        } else if (group.type === 'sample') {
          var filters_ = []
          _.each(group.attributes, function (attributes) {
            if (attributes.filter.length > 0)
              filters_[attributes.attr_id] = attributes.filter;
          });
          var temp = $.extend(true, _result.filters['samples'], filters_);
          var array = $.extend(true, {}, temp)
          _result.filters['samples'] = array;
        }
      });
      _result['selected_cases'] = _selectedCases;
      return _result;
    },

    vm: function () {
      return vm_;
    },
    view: {
      component: {},
      grid: {
        get: function () {
          return grid_;
        },
        layout: function () {
          grid_.layout();
        }
      }
    },
    util: {},
    opts: {
      dc: {
        transitionDuration: 400
      }
    },
    applyVC: function (_vc) {
      var _selectedSamples = [], _selectedPatients = [];
      _.each(_.pluck(_vc.selectedCases, "samples"), function (_arr) {
        _selectedSamples = _selectedSamples.concat(_arr);
      });
      _.each(_.pluck(_vc.selectedCases, "patients"), function (_arr) {
        _selectedPatients = _selectedPatients.concat(_arr);
      });
      iViz.init(data_, _selectedSamples, _selectedPatients);
    }
  }
}(window._, window.$));

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 3/16/16.
 */

'use strict';
(function(Vue, iViz, dc, _) {
  iViz.vue = {};

  iViz.vue.manage = (function() {
    var vmInstance_;

    return {
      init: function() {
        vmInstance_ = new Vue({
          el: '#complete-screen',
          data: {
            groups: [],
            selectedsamples: [],
            selectedpatients: [],
            selectedgenes: [],
            addNewVC: false,
            selectedPatientsNum: 0,
            selectedSamplesNum: 0,
            hasfilters: false,
            isloading: true,
            redrawgroups:[],
            customfilter:{
              display_name:"Custom",
              type:"",
              sampleIds:[],
              patientIds:[]
            },
            charts: {},
            groupCount:0,
            updateSpecialCharts:false,
            showSaveButton:true,
            showManageButton:true,
            userid:'DEFAULT',
            stats:'',
            updateStats:false,
            highlightAllButtons:false,
            highlightCaseButtons:false
          }, watch: {
            'updateSpecialCharts':function(newVla,oldVal) {
              var self_ = this;
              //TODO: need to update setting timeout
              var interval = setTimeout(function () {
                clearInterval(interval);
                self_.$broadcast('update-special-charts');
              }, 500);
            },
            'updateStats':function(newVal){
              this.stats = iViz.stat();
            },
            'redrawgroups':function(newVal,oldVal){
              if(newVal.length>0){
                this.$broadcast('show-loader');
                _.each(newVal, function(groupid){
                  dc.redrawAll(groupid);
                });
                this.redrawgroups = [];
                var self_ =this;
                 this.$nextTick(function(){
                   self_.updateSpecialCharts = !self_.updateSpecialCharts;
                 });
                
              }
            },
            'selectedsamples': function(newVal,oldVal) {
              if(newVal.length!==oldVal.length){
                this.selectedSamplesNum = newVal.length;
              }
            },
            'selectedpatients': function(newVal,oldVal) {
              if(newVal.length!==oldVal.length){
                this.selectedPatientsNum = newVal.length;
              }
            }
          }, events: {
            'redraw-all-charts':function(){
              this.redrawgroups.push(true);
            },'manage-genes':function(geneList){
              this.updateGeneList(geneList,false);
            },'set-selected-cases' : function(selectionType, selectedCases){
              this.setSelectedCases(selectionType, selectedCases);
            },'remove-chart':function(attrId,groupId){
              this.removeChart(attrId,groupId)
            }
          },methods: {
            openCases:function(){
              iViz.openCases();
            },
            downloadCaseData:function(){
              iViz.downloadCaseData();
            },
            submitForm:function(){
              iViz.submitForm();
            },
            clearAll: function(){
              if(this.customfilter.patientIds.length>0||this.customfilter.sampleIds.length>0){
                this.customfilter.sampleIds = [];
                this.customfilter.patientIds = [];
                this.$broadcast('update-all-filters');
              }
              this.$broadcast('clear-all-groups');
              var self_ = this;
              this.hasfilters = false;
              self_.$nextTick(function () {
                self_.selectedsamples =  _.keys(iViz.getCasesMap('sample'));
                self_.selectedpatients = _.keys(iViz.getCasesMap('patient'));
                self_.$broadcast('update-special-charts');
                _.each(this.groups,function(group){
                  dc.redrawAll(group.id);
                });
              });
            },
            addChart: function(attrId){
              var self_ = this;
              var attrData = self_.charts[attrId];
              var _attrAdded = false;
              var _group = {};
              _.each(self_.groups,function(group){
                if(group.type === attrData.group_type){
                  if(group.attributes.length<31){
                    attrData.group_id = group.id;
                    group.attributes.push(attrData);
                    _attrAdded = true;
                    return false;
                  }else{
                    _group = group;
                  }
                }
              });
              if(!_attrAdded){
                var newgroup_ = {};
                var groupAttrs = [];
                groupAttrs.push(attrData);
                // newgroup_.data = _group.data;
                newgroup_.type = _group.type;
                newgroup_.id = self_.groupCount;
                self_.groupCount = self_.groupCount+1;
                newgroup_.attributes = groupAttrs;
                self_.groups.push(newgroup_);
              }

            },
            removeChart: function(attrId){
              var self = this;
              var attrData = self.charts[attrId];
              var attributes = self.groups[attrData.group_id].attributes;
              attributes.$remove(attrData);

              self.$nextTick(function () {
                self.$broadcast('update-grid',true);
                $("#iviz-add-chart").trigger("chosen:updated");
              })
            },
            updateGeneList : function(geneList,reset){
              var self_ = this;
              if(reset){
                self_.selectedgenes = geneList;
              }else{
                _.each(geneList,function(gene){
                  var index = self_.selectedgenes.indexOf(gene);
                  if(index === -1) {
                    self_.selectedgenes.push(gene);
                  }
                  else{
                    self_.selectedgenes.splice(index, 1);
                  }
                });
              }
              this.$broadcast('gene-list-updated',self_.selectedgenes);
            },
            setSelectedCases : function(selectionType, selectedCases){
              var radioVal = selectionType;
              var selectedCaseIds = [];
              var unmappedCaseIds = [];

              if (radioVal === 'patient') {
                var patientIdsList = Object.keys(iViz.getCasesMap('patient'));
                _.each(selectedCases, function (id) {
                  if(patientIdsList.indexOf(id) !== -1){
                    selectedCaseIds.push(id);
                  }else{
                    unmappedCaseIds.push(id)
                  }
                });
              } else {
                var sampleIdsList = Object.keys(iViz.getCasesMap('sample'));
                _.each(selectedCases, function (id) {
                  if(sampleIdsList.indexOf(id) !== -1){
                    selectedCaseIds.push(id);
                  }else{
                    unmappedCaseIds.push(id)
                  }
                });
              }

              if (unmappedCaseIds.length > 0) {
                new Notification().createNotification(selectedCaseIds.length +
                  ' cases selected. The following ' + (radioVal === 'patient' ? 'patient' : 'sample') +
                  ' ID' + (unmappedCaseIds.length === 1 ? ' was' : 's were') + ' not found in this study: ' +
                  unmappedCaseIds.join(', '), {message_type: 'warning'});
              } else {
                new Notification().createNotification(selectedCaseIds.length + ' case(s) selected.', {message_type: 'info'});
              }

              $('#iviz-header-right-1').qtip('toggle');
              if(selectedCaseIds.length > 0) {
                this.clearAll();
                var self_ = this;
                Vue.nextTick(function () {

                  _.each(self_.groups,function(group){
                    if(group.type === radioVal){
                      self_.hasfilters = true;
                      self_.customfilter.type = group.type;
                      if(radioVal ==='sample'){
                        self_.customfilter.sampleIds = selectedCaseIds;
                        self_.customfilter.patientIds = [];
                      }else{
                        self_.customfilter.patientIds = selectedCaseIds;
                        self_.customfilter.sampleIds = [];
                      }
                      self_.$broadcast('update-custom-filters');
                      return false;
                    }
                  });
                })
              }

            }
          }, ready: function() {
            this.$watch('showVCList', function() {
              if (_.isObject(iViz.session)) {
                this.virtualCohorts = iViz.session.utils.getVirtualCohorts();
              }
            });
            $('.iviz-header-left-5').qtip({
              content: {text: 'Click to view the selected cases' },
              style: { classes: 'qtip-light qtip-rounded qtip-shadow' },
              show: {event: 'mouseover'},
              hide: {fixed:true, delay: 100, event: 'mouseout'},
              position: {my:'bottom center', at:'top center', viewport: $(window)}
            });
            $('#iviz-header-left-6').qtip({
              content: {text: 'Click to download the selected cases' },
              style: { classes: 'qtip-light qtip-rounded qtip-shadow' },
              show: {event: 'mouseover'},
              hide: {fixed:true, delay: 100, event: 'mouseout'},
              position: {my:'bottom center', at:'top center', viewport: $(window)}
            })
          }
        });
      },
      getInstance: function() {
        if (typeof vmInstance_ === 'undefined') {
          this.init();
        }
        return vmInstance_;
      },
      setSelectedCases : function(selectionType, selectedCases){
        vmInstance_.setSelectedCases(selectionType, selectedCases);
      },
      setGeneList : function(geneList){
        vmInstance_.updateGeneList(geneList,true)
      },
      getGeneList : function(){
        return vmInstance_.selectedgenes;
      }
    };
  })();


  Vue.directive('select', {
    twoWay: true,
    params: ['charts'],
    paramWatchers: {
      charts: function (val, oldVal) {
        $("#iviz-add-chart").trigger("chosen:updated");
      }
    },
    bind: function() {
      var self = this;
      $(this.el).chosen({
          width: '30%'
        })
        .change(function() {
              var value = this.el.value;
              self.params.charts[value].show = true;
              self.vm.addChart(this.el.value);
              self.vm.$nextTick(function () {
                $("#iviz-add-chart").trigger("chosen:updated");
              });
          }.bind(this)
        );
    }
  });

  // This is an example to add sample to a virtual cohort from scatter plot
/*  iViz.vue.vmScatter = (function() {
    var vmInstance_;

    return {
      init: function() {
        vmInstance_ = new Vue({
          el: '#scatter-container',
          data: {
            showList: false,
            virtualCohorts: null,
            sampleID: null,
            cancerStudyID: null,
            addNewVC: false
          }, ready: function() {
            this.$watch('showList', function() {
              if (_.isObject(iViz.session)) {
                this.virtualCohorts = iViz.session.utils.getVirtualCohorts();
              }
            });
          }
        });
      },
      getInstance: function() {
        if (typeof vmInstance_ === 'undefined') {
          this.init();
        }
        return vmInstance_;
      }
    };
  })();*/
})(window.Vue, window.iViz, window.dc,window._);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

'use strict';
(function(iViz, _, cbio) {
  iViz.util = (function() {
    var content = {};

    /**
     * Convert number to specific precision end.
     * @param {number} number The number you want to convert.
     * @param {integer} precision Significant figures.
     * @param {number} threshold The upper bound threshold.
     * @return {number} Converted number.
     */
    content.toPrecision = function(number, precision, threshold) {
      if (number >= 0.000001 && number < threshold) {
        return number.toExponential(precision);
      }
      return number.toPrecision(precision);
    };

    /**
     * iViz color schema.
     * @return {string[]} Color array.
     */
    content.getColors = function() {
      return [
        '#2986e2', '#dc3912', '#f88508', '#109618',
        '#990099', '#0099c6', '#dd4477', '#66aa00',
        '#b82e2e', '#316395', '#994499', '#22aa99',
        '#aaaa11', '#6633cc', '#e67300', '#8b0707',
        '#651067', '#329262', '#5574a6', '#3b3eac',
        '#b77322', '#16d620', '#b91383', '#f4359e',
        '#9c5935', '#a9c413', '#2a778d', '#668d1c',
        '#bea413', '#0c5922', '#743411', '#743440',
        '#9986e2', '#6c3912', '#788508', '#609618',
        '#790099', '#5099c6', '#2d4477', '#76aa00',
        '#882e2e', '#916395', '#794499', '#92aa99',
        '#2aaa11', '#5633cc', '#667300', '#100707',
        '#751067', '#229262', '#4574a6', '#103eac',
        '#177322', '#66d620', '#291383', '#94359e',
        '#5c5935', '#29c413', '#6a778d', '#868d1c',
        '#5ea413', '#6c5922', '#243411', '#103440',
        '#2886e2', '#d93912', '#f28508', '#110618',
        '#970099', '#0109c6', '#d10477', '#68aa00',
        '#b12e2e', '#310395', '#944499', '#24aa99',
        '#a4aa11', '#6333cc', '#e77300', '#820707',
        '#610067', '#339262', '#5874a6', '#313eac',
        '#b67322', '#13d620', '#b81383', '#f8359e',
        '#935935', '#a10413', '#29778d', '#678d1c',
        '#b2a413', '#075922', '#763411', '#773440',
        '#2996e2', '#dc4912', '#f81508', '#104618',
        '#991099', '#0049c6', '#dd2477', '#663a00',
        '#b84e2e', '#312395', '#993499', '#223a99',
        '#aa1a11', '#6673cc', '#e66300', '#8b5707',
        '#656067', '#323262', '#5514a6', '#3b8eac',
        '#b71322', '#165620', '#b99383', '#f4859e',
        '#9c4935', '#a91413', '#2a978d', '#669d1c',
        '#be1413', '#0c8922', '#742411', '#744440',
        '#2983e2', '#dc3612', '#f88808', '#109518',
        '#990599', '#0092c6', '#dd4977', '#66a900',
        '#b8282e', '#316295', '#994199', '#22a499',
        '#aaa101', '#66310c', '#e67200', '#8b0907',
        '#651167', '#329962', '#5573a6', '#3b37ac',
        '#b77822', '#16d120', '#b91783', '#f4339e',
        '#9c5105', '#a9c713', '#2a710d', '#66841c',
        '#bea913', '#0c5822', '#743911', '#743740',
        '#298632', '#dc3922', '#f88588', '#109658',
        '#990010', '#009916', '#dd4447', '#66aa60',
        '#b82e9e', '#316365', '#994489', '#22aa69',
        '#aaaa51', '#66332c', '#e67390', '#8b0777',
        '#651037', '#329232', '#557486', '#3b3e4c',
        '#b77372', '#16d690', '#b91310', '#f4358e',
        '#9c5910', '#a9c493', '#2a773d', '#668d5c',
        '#bea463', '#0c5952', '#743471', '#743450',
        '#2986e3', '#dc3914', '#f88503', '#109614',
        '#990092', '#0099c8', '#dd4476', '#66aa04',
        '#b82e27', '#316397', '#994495', '#22aa93',
        '#aaaa14', '#6633c1', '#e67303', '#8b0705',
        '#651062', '#329267', '#5574a1', '#3b3ea5'
      ];
    };

    content.idMapping = function(mappingObj, inputCases) {
      var _selectedMappingCases = [];
      _selectedMappingCases.length = 0;
      var resultArr_ = [];
      var tempArr_ = {};
      _.each(inputCases, function(_case) {
        _.each(mappingObj[_case],function(_caseSel){
          if(tempArr_[_caseSel] === undefined){
            tempArr_[_caseSel] = true;
            resultArr_.push(_caseSel)
          }
        });
        //_selectedMappingCases = _selectedMappingCases.concat(mappingObj[_case]);
      });
      return resultArr_;
      //return content.unique(_selectedMappingCases);
    };
    
    content.unique = function(arr_){
      var resultArr_ = [];
      var tempArr_ = {};
      _.each(arr_,function(obj_){
        if(tempArr_[obj_] === undefined){
          tempArr_[obj_] = true;
          resultArr_.push(obj_);
        }
      });
      return resultArr_;
    };

    content.isRangeFilter = function(filterObj) {
      if (filterObj.filterType !== undefined) {
        if (filterObj.filterType === 'RangedFilter') {
          return true;
        }
      }
      return false;
    };

    content.sortByAttribute = function(objs, attrName) {
      function compare(a, b) {
        if (a[attrName] < b[attrName]) {
          return -1;
        }
        if (a[attrName] > b[attrName]) {
          return 1;
        }
        return 0;
      }

      objs.sort(compare);
      return objs;
    };

    content.download = function(chartType, fileType, content) {
      switch (chartType) {
        case 'pieChart':
          pieChartDownload(fileType, content);
          break;
        case 'barChart':
          barChartDownload(fileType, content);
          break;
        case 'survivalPlot':
          survivalChartDownload(fileType, content);
          break;
        case 'scatterPlot':
          survivalChartDownload(fileType, content);
          break;
        case 'table':
          tableDownload(fileType, content);
        default:
          break;
      }
    };

    content.restrictNumDigits = function(str) {
      if (!isNaN(str)) {
        var num = Number(str);
        if (num % 1 !== 0) {
          num = num.toFixed(2);
          str = num.toString();
        }
      }
      return str;
    }

    function tableDownload(fileType, content) {
      switch (fileType) {
        case 'tsv':
          csvDownload(content.fileName, content.data);
          break;
        default:
          break;
      }
    }

    function pieChartDownload(fileType, content) {
      switch (fileType) {
        case 'tsv':
          csvDownload(content.fileName || 'data', content.data);
          break;
        case 'svg':
          pieChartCanvasDownload(content, {
            filename: content.fileName + '.svg'
          });
          break;
        case 'pdf':
          pieChartCanvasDownload(content, {
            filename: content.fileName + '.pdf',
            contentType: 'application/pdf',
            servletName: 'http://localhost:8080/cbioportal/svgtopdf.do'
          });
          break;
        default:
          break;
      }
    }

    function getPieWidthInfo(data) {
      var length = data.title.length;
      var labels = data.labels;
      var labelMaxName = _.last(_.sortBy(_.pluck(labels, 'name'), function(item) {
        return item.toString().length;
      })).toString().length;
      var labelMaxNumber = _.last(_.sortBy(_.pluck(labels, 'samples'), function(item) {
        return item.toString().length;
      })).toString().length;
      var labelMaxFreq = _.last(_.sortBy(_.pluck(labels, 'sampleRate'), function(item) {
        return item.toString().length;
      })).toString().length;

      if (labelMaxName > length) {
        length = labelMaxName;
      }
      length = length * 10 + labelMaxNumber * 10 + labelMaxFreq * 10 + 30;

      return {
        svg: length,
        name: labelMaxName > data.title.length ? labelMaxName : data.title.length,
        number: labelMaxNumber,
        freq: labelMaxFreq
      };
    }

    function pieChartCanvasDownload(data, downloadOpts) {
      var _svgElement;

      var _width = getPieWidthInfo(data);
      var _valueXCo = 0;
      var _pieLabelString = '';
      var _pieLabelYCoord = 0;
      var _svg = $('#' + data.chartId + ' svg');
      var _previousHidden = false;

      if ($('#' + data.chartDivId).css('display') === 'none') {
        _previousHidden = true;
        $('#' + data.chartDivId).css('display', 'block');
      }

      var _svgHeight = _svg.height();
      var _text = _svg.find('text');
      var _textLength = _text.length;
      var _slice = _svg.find('g .pie-slice');
      var _sliceLength = _slice.length;
      var _pieLabel = data.labels;
      var _pieLabelLength = _pieLabel.length;
      var i = 0;

      if (_previousHidden) {
        $('#' + data.chartDivId).css('display', 'none');
      }

      // Change pie slice text styles
      for (i = 0; i < _textLength; i++) {
        $(_text[i]).css({
          'fill': 'white',
          'font-size': '14px',
          'stroke': 'white',
          'stroke-width': '1px'
        });
      }

      // Change pie slice styles
      for (i = 0; i < _sliceLength; i++) {
        $($(_slice[i]).find('path')[0]).css({
          'stroke': 'white',
          'stroke-width': '1px'
        });
      }

      if (_width.svg < 180) {
        _width.svg = 180;
      }

      // Draw sampleSize header
      _pieLabelString += '<g transform="translate(0, ' +
        _pieLabelYCoord + ')"><text x="13" y="10" ' +
        'style="font-size:12px; font-weight:bold">' +
        data.title + '</text>' +
        '<text x="' + _width.name * 10 + '" y="10" ' +
        'style="font-size:12px; font-weight:bold">#</text>' +
        '<text x="' + (_width.name + _width.number) * 10 + '" y="10" ' +
        'style="font-size:12px; font-weight:bold">Freq</text>' +
        '<line x1="0" y1="14" x2="' + ((_width.name + _width.number) * 10 - 20) + '" y2="14" ' +
        'style="stroke:black;stroke-width:2"></line>' +
        '<line x1="' + (_width.name * 10 - 10) + '" y1="14" x2="' + (_width.svg - 20) + '" y2="14" ' +
        'style="stroke:black;stroke-width:2"></line>' +
        '<line x1="' + ((_width.name + _width.number) * 10 - 10) + '" y1="14" x2="' + (_width.svg - 20) + '" y2="14" ' +
        'style="stroke:black;stroke-width:2"></line>' +
        '</g>';

      _pieLabelYCoord += 18;

      // Draw pie label into output
      for (i = 0; i < _pieLabelLength; i++) {
        var _label = _pieLabel[i];

        _pieLabelString += '<g transform="translate(0, ' +
          _pieLabelYCoord + ')"><rect height="10" width="10" fill="' + _label.color +
          '"></rect><text x="13" y="10" ' +
          'style="font-size:15px">' + _label.name + '</text>' +
          '<text x="' + _width.name * 10 + '" y="10" ' +
          'style="font-size:15px">' + _label.samples + '</text>' +
          '<text x="' + (_width.name + _width.number) * 10 + '" y="10" ' +
          'style="font-size:15px">' + _label.sampleRate + '</text>' +
          '</g>';

        _pieLabelYCoord += 15;
      }

      _svgElement = cbio.download.serializeHtml($('#' + data.chartId + ' svg>g')[0]);

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + _width.svg + '" height="' + (180 + _pieLabelYCoord) + '">' +
        '<g><text x="' + (_width.svg / 2) + '" y="20" style="font-weight: bold;" text-anchor="middle">' +
        data.title + '</text></g>' +
        '<g transform="translate(' + (_width.svg / 2 - 65) + ', 20)">' + _svgElement + '</g>' +
        '<g transform="translate(10, ' + (_svgHeight + 20) + ')">' +
        _pieLabelString + '</g></svg>';

      cbio.download.initDownload(svg, downloadOpts);

      // Remove pie slice text styles
      for (i = 0; i < _textLength; i++) {
        $(_text[i]).css({
          'fill': '',
          'font-size': '',
          'stroke': '',
          'stroke-width': ''
        });
      }

      // Remove pie slice styles
      for (i = 0; i < _sliceLength; i++) {
        $($(_slice[i]).find('path')[0]).css({
          'stroke': '',
          'stroke-width': ''
        });
      }
    }

    function barChartCanvasDownload(data, downloadOpts) {
      var _svgElement = '';
      var _svg = $('#' + data.chartId + ' svg');
      var _brush = _svg.find('g.brush');
      var _brushWidth = Number(_brush.find('rect.extent').attr('width'));
      var i = 0;

      if (_brushWidth === 0) {
        _brush.css('display', 'none');
      }

      _brush.find('rect.extent')
        .css({
          'fill-opacity': '0.2',
          'fill': '#2986e2'
        });

      _brush.find('.resize path')
        .css({
          'fill': '#eee',
          'stroke': '#666'
        });

      // Change deselected bar chart
      var _chartBody = _svg.find('.chart-body');
      var _deselectedCharts = _chartBody.find('.bar.deselected');
      var _deselectedChartsLength = _deselectedCharts.length;

      for (i = 0; i < _deselectedChartsLength; i++) {
        $(_deselectedCharts[i]).css({
          'stroke': '',
          'fill': '#ccc'
        });
      }

      // Change axis style
      var _axis = _svg.find('.axis');
      var _axisDomain = _axis.find('.domain');
      var _axisDomainLength = _axisDomain.length;
      var _axisTick = _axis.find('.tick.major line');
      var _axisTickLength = _axisTick.length;

      for (i = 0; i < _axisDomainLength; i++) {
        $(_axisDomain[i]).css({
          'fill': 'white',
          'fill-opacity': '0',
          'stroke': 'black'
        });
      }

      for (i = 0; i < _axisTickLength; i++) {
        $(_axisTick[i]).css({
          'stroke': 'black'
        });
      }

      //Change x/y axis text size
      var _chartText = _svg.find('.axis text'),
        _chartTextLength = _chartText.length;

      for (i = 0; i < _chartTextLength; i++) {
        $(_chartText[i]).css({
          'font-size': '12px'
        });
      }

      $('#' + data.chartId + ' svg>g').each(function(i, e) {
        _svgElement += cbio.download.serializeHtml(e);
      });
      $('#' + data.chartId + ' svg>defs').each(function(i, e) {
        _svgElement += cbio.download.serializeHtml(e);
      });

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="370" height="200">' +
        '<g><text x="180" y="20" style="font-weight: bold; text-anchor: middle">' +
        data.title + '</text></g>' +
        '<g transform="translate(0, 20)">' + _svgElement + '</g></svg>';

      cbio.download.initDownload(
        svg, downloadOpts);

      _brush.css('display', '');

      // Remove added styles
      _brush.find('rect.extent')
        .css({
          'fill-opacity': '',
          'fill': ''
        });

      _brush.find('.resize path')
        .css({
          'fill': '',
          'stroke': ''
        });

      for (i = 0; i < _deselectedChartsLength; i++) {
        $(_deselectedCharts[i]).css({
          'stroke': '',
          'fill': ''
        });
      }

      for (i = 0; i < _axisDomainLength; i++) {
        $(_axisDomain[i]).css({
          'fill': '',
          'fill-opacity': '',
          'stroke': ''
        });
      }

      for (i = 0; i < _axisTickLength; i++) {
        $(_axisTick[i]).css({
          'stroke': ''
        });
      }

      for (i = 0; i < _chartTextLength; i++) {
        $(_chartText[i]).css({
          'font-size': ''
        });
      }
    }

    function survivalChartDownload(fileType, content) {
      switch (fileType) {
        case 'svg':
          survivalChartCanvasDownload(content, {
            filename: content.fileName + '.svg'
          });
          break;
        case 'pdf':
          survivalChartCanvasDownload(content, {
            filename: content.fileName + '.pdf',
            contentType: 'application/pdf',
            servletName: 'http://localhost:8080/cbioportal/svgtopdf.do'
          });
          break;
        default:
          break;
      }
    }

    function survivalChartCanvasDownload(data, downloadOpts) {
      var _svgElement, _svgLabels, _svgTitle,
        _labelTextMaxLength = 0,
        _numOfLabels = 0,
        _svgWidth = 360,
        _svgheight = 360;

      _svgElement = cbio.download.serializeHtml($('#' + data.chartDivId + ' svg')[0]);
      // _svgLabels = $('#' + data.labelDivId + ' svg');
      //
      // _svgLabels.find('image').remove();
      // _svgLabels.find('text').each(function(i, obj) {
      //   var _value = $(obj).attr('oValue');
      //
      //   if (typeof _value === 'undefined') {
      //     _value = $(obj).text();
      //   }
      //
      //   if (_value.length > _labelTextMaxLength) {
      //     _labelTextMaxLength = _value.length;
      //   }
      //   $(obj).text(_value);
      //   _numOfLabels++;
      // });

      _svgWidth += _labelTextMaxLength * 14;

      if (_svgheight < _numOfLabels * 20) {
        _svgheight = _numOfLabels * 20 + 40;
      }

      // _svgLabels = cbio.download.serializeHtml(_svgLabels[0]);

      _svgTitle = '<g><text text-anchor="middle" x="210" y="30" ' +
        'style="font-weight:bold">' + data.title + '</text></g>';

      _svgElement = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + _svgWidth + 'px" height="' + _svgheight + 'px" style="font-size:14px">' +
        _svgTitle + '<g transform="translate(0,40)">' +
        _svgElement + '</g>' +
        // '<g transform="translate(370,50)">' +
        // _svgLabels + '</g>' +
        '</svg>';

      cbio.download.initDownload(
        _svgElement, downloadOpts);
    }

    function csvDownload(fileName, content) {
      fileName = fileName || 'test';
      var downloadOpts = {
        filename: fileName + '.txt',
        contentType: 'text/plain;charset=utf-8',
        preProcess: false
      };

      cbio.download.initDownload(content, downloadOpts);
    }

    function barChartDownload(fileType, content) {
      switch (fileType) {
        case 'tsv':
          csvDownload(content.fileName || 'data', content.data);
          break;
        case 'svg':
          barChartCanvasDownload(content, {
            filename: content.fileName + '.svg'
          });
          break;
        case 'pdf':
          barChartCanvasDownload(content, {
            filename: content.fileName + '.pdf',
            contentType: 'application/pdf',
            servletName: 'http://localhost:8080/cbioportal/svgtopdf.do'
          });
          break;
        default:
          break;
      }
    }

    function downloadTextFile(content, delimiter) {

    }

    /**
     * Finds the intersection elements between two arrays in a simple fashion.
     * Should have O(n) operations, where n is n = MIN(a.length, b.length)
     *
     * @param a {Array} first array, must already be sorted
     * @param b {Array} second array, must already be sorted
     * @returns {Array}
     */
    content.intersection = function(a, b) {
      var result = [], i = 0, j = 0, aL = a.length, bL = b.length, size = 0;
      while (i < aL && j < bL) {
        if (a[i] < b[j]) {
          ++i;
        }
        else if (a[i] > b[j]) {
          ++j;
        }
        else /* they're equal */
        {
          result.push(a[i]);
          ++i;
          ++j;
        }
      }

      return result;
    };

    content.compare = function(arr1, arr2) {
      if (arr1.length != arr2.length){
        return false;
      }else{
        for (var i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i])
            return false;
        }
      }
      return true;
    };

    return content;
  })();
})(window.iViz,
  window._, window.cbio);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

/**
 * @author suny1@mskcc.org on 3/15/16.
 */

'use strict';
(function(iViz, $, _){
  iViz.sync = {};
  // syncing util: select samples or patients based on only samples/patients filters
  iViz.sync.selectByFilters = function(filters, data) { // type: sample or patient
    var _selectedCasesData = data;
    _.each(Object.keys(filters), function(_filterAttrId) {
    
      var tempData = _selectedCasesData;
      _selectedCasesData=[];
      var _singleAttrSelectedCases =[];
      var _filtersForSingleAttr = filters[_filterAttrId];
      if (iViz.util.isRangeFilter(_filtersForSingleAttr)) {
      
        var _filterRangeMin = parseFloat(_filtersForSingleAttr[0]);
        var _filterRangeMax = parseFloat(_filtersForSingleAttr[1]);
        _.each(tempData, function(_dataObj) {
          if (_dataObj.hasOwnProperty(_filterAttrId)) {
            if (parseFloat(_dataObj[_filterAttrId]) <= _filterRangeMax && parseFloat(_dataObj[_filterAttrId]) >= _filterRangeMin) {
              _selectedCasesData.push(_dataObj);
            }
          }
        });
      
      } else {
        _.each(tempData, function(_dataObj) {
          if (_dataObj.hasOwnProperty(_filterAttrId)) {
            if ($.inArray(_dataObj[_filterAttrId], _filtersForSingleAttr) !== -1) {
              _selectedCasesData.push(_dataObj);
            }
          }
        });
      }
    });
    return _selectedCasesData;
  };

  iViz.sync.selectByCases = function(type_, data_, cases_) {
    var caseIndices = iViz.getCaseIndices(type_);
    var resultData_ = [];
    _.each(cases_, function(val){
      resultData_.push(data_[caseIndices[val]]);
    });
    return resultData_;
  };
  
  return iViz.sync;
}(window.iViz, window.$, window._));


/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

/**
 * @author suny1@mskcc.org on 3/15/16.
 */

'use strict';
(function(iViz, dc) {

  iViz.event = {};
  iViz.shared = {};

  iViz.shared.resetAll = function(_chartInst, _groupid, _attributes) {
    if ((_attributes !== undefined) && (_attributes.view_type === 'scatter_plot')) {
      _chartInst.reset();
    } else {
      if(_chartInst.filters().length>0){
        _chartInst.filterAll();
        dc.redrawAll(_groupid);
      }
    }
  }
  iViz.shared.updateFilters = function(filter, filters, type) {
    if (filter === null) {
      filters = [];
    } else {
      if (type === 'bar_chart') {
        //delay event trigger for bar charts
        dc.events.trigger(function() {
          filters = filter
        }, 0);
      } else if (type === 'pie_chart') {
          //add filter
        if(filter instanceof Array){
          filters = filter;
        }else{
          if ($.inArray(filter, filters) === -1) {
            filters.push(filter);
            //remove filter
          } else {
            filters = _.filter(filters, function(d) {
              return d !== filter;
            });
          }
        }
      }
    }
    return filters
  }
}(window.iViz, window.dc));

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/13/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  Vue.component('mainTemplate', {
    template: ' <chart-group :redrawgroups.sync="redrawgroups" :id="group.id" :type="group.type" :mappedpatients="patientsync"' +
    ' :mappedsamples="samplesync" :attributes.sync="group.attributes"' +
    ' v-for="group in groups"></chart-group> ',
    props: [
      'groups', 'selectedsamples', 'selectedpatients', 'hasfilters', 'redrawgroups', 'customfilter'
    ], data: function() {
      return {
        messages: [],
        patientsync: [],
        samplesync: [],
        grid_: '',
        completePatientsList: [],
        completeSamplesList: [],
        selectedPatientsByFilters : [],
        selectedSamplesByFilters : [],
        initialized : false
      }
    }, watch: {
      'groups': function(){
        if(!this.initialized){
          this.initialized = true;
          this.selectedPatientsByFilters = _.keys(iViz.getCasesMap('patient')).sort();
          this.selectedSamplesByFilters = _.keys(iViz.getCasesMap('sample')).sort();
          this.completePatientsList = _.keys(iViz.getCasesMap('patient')).sort();
          this.completeSamplesList = _.keys(iViz.getCasesMap('sample')).sort();
        }
      },
      /*'patientmap':function(val){
        this.completePatientsList =  _.keys(val);
      },
      'samplemap' : function(val){
        this.completeSamplesList =  _.keys(val);
      },*/
      'messages': function(val) {
        _.each(this.groups, function(group) {
          dc.renderAll(group.id);
        });
        this.updateGrid();
      }
    }, methods: {
      updateGrid: function() {
        if (this.grid_ !== '') {
          this.grid_.destroy();
        }
        this.grid_ = new Packery(document.querySelector('.grid'), {
          itemSelector: '.grid-item',
          columnWidth: 190,
          rowHeight: 170,
          gutter: 5
        });
        var self_ = this;
        _.each(self_.grid_.getItemElements(), function(_gridItem) {
          var _draggie = new Draggabilly(_gridItem, {
            handle: '.dc-chart-drag'
          });
          self_.grid_.bindDraggabillyEvents(_draggie);
        });
        self_.grid_.layout();
      }
    },
    events: {
      'clear-all-groups':function(){
        this.selectedPatientsByFilters = [];
        this.selectedSamplesByFilters = [];
        this.$broadcast('clear-group');
      },
      'update-grid': function(reload) {
        if(reload){
          this.updateGrid()
        }else{
          this.grid_.layout();
        }
      },
      'data-loaded': function(msg) {
        // TODO:check for all charts loaded
        this.messages.push(msg);
      },
      'update-all-filters':function(updateType_){
        var _allSelectedPatientIdsByFilters = [];
        var _allSelectedSampleIdsByFilters = [];
        var self_ = this;
        var _hasFilters = false;

        if (self_.customfilter.patientIds.length > 0) {
          _hasFilters = true;
          _allSelectedPatientIdsByFilters = self_.customfilter.patientIds;
        }
        if (self_.customfilter.sampleIds.length > 0) {
          _hasFilters = true;
          _allSelectedSampleIdsByFilters = self_.customfilter.sampleIds;
        }

        _.each(self_.groups, function (group) {
          _.each(group.attributes, function (attributes) {
            if (attributes.show) {
              if (attributes.filter.length > 0) {
                _hasFilters = true;
              }
            }
          });

          var _groupFilteredCases = iViz.getGroupFilteredCases(group.id);
          if (_groupFilteredCases !== undefined && _groupFilteredCases.length > 0) {
            if (updateType_ === group.type) {
              if (updateType_ === 'patient') {
                if (_groupFilteredCases.length !== self_.completePatientsList.length)
                  if (_allSelectedPatientIdsByFilters.length === 0) {
                    _allSelectedPatientIdsByFilters = _groupFilteredCases;
                  } else {
                    _allSelectedPatientIdsByFilters = iViz.util.intersection(_allSelectedPatientIdsByFilters, _groupFilteredCases);
                  }
              } else {
                if (_groupFilteredCases.length !== self_.completeSamplesList.length)
                  if (_allSelectedSampleIdsByFilters.length === 0) {
                    _allSelectedSampleIdsByFilters = _groupFilteredCases;
                  } else {
                    _allSelectedSampleIdsByFilters = iViz.util.intersection(_allSelectedSampleIdsByFilters, _groupFilteredCases);
                  }
              }
            }
          }
        });
        self_.hasfilters = _hasFilters;

        var _resultSelectedSamples = [];
        var _resultSelectedPatients = [];
        if (updateType_ === 'patient') {
          self_.selectedPatientsByFilters = _allSelectedPatientIdsByFilters.sort();
          var _selectedSamplesByFiltersOnly = self_.selectedSamplesByFilters;
          if(_selectedSamplesByFiltersOnly.length ===0){
            _selectedSamplesByFiltersOnly = self_.completeSamplesList;
          }
          if (_allSelectedPatientIdsByFilters.length === 0) {
            self_.patientsync = [];
            self_.samplesync = [];
            _resultSelectedSamples = iViz.util.intersection(self_.completeSamplesList,
              _selectedSamplesByFiltersOnly);
            _resultSelectedPatients = iViz.util.idMapping(iViz.getCasesMap('sample'), _resultSelectedSamples);
          } else {
            var _mappedSelectedSamples = iViz.util.idMapping(iViz.getCasesMap('patient'), _allSelectedPatientIdsByFilters);
            _mappedSelectedSamples.sort();
            _resultSelectedSamples = iViz.util.intersection(_mappedSelectedSamples,
              _selectedSamplesByFiltersOnly);
            _resultSelectedPatients = iViz.util.idMapping(iViz.getCasesMap('sample'), _resultSelectedSamples);
            self_.patientsync = _allSelectedPatientIdsByFilters;
            self_.samplesync = _mappedSelectedSamples;

          }
        } else {
          self_.selectedSamplesByFilters = _allSelectedSampleIdsByFilters.sort();
          var _selectedPatientsByFiltersOnly = self_.selectedPatientsByFilters;
          if(_selectedPatientsByFiltersOnly.length ===0){
            _selectedPatientsByFiltersOnly = self_.completePatientsList;
          }
          if (_allSelectedSampleIdsByFilters.length === 0) {
            self_.patientsync = [];
            self_.samplesync = [];
            _resultSelectedPatients = iViz.util.intersection(self_.completePatientsList,
              _selectedPatientsByFiltersOnly);
            _resultSelectedSamples = iViz.util.idMapping(iViz.getCasesMap('patient'), _resultSelectedPatients);
          } else {
            var _mappedSelectedPatients = iViz.util.idMapping(iViz.getCasesMap('sample'), _allSelectedSampleIdsByFilters);
            _mappedSelectedPatients.sort();
            _resultSelectedPatients = iViz.util.intersection(_mappedSelectedPatients,
              _selectedPatientsByFiltersOnly);
            _resultSelectedSamples = iViz.util.idMapping(iViz.getCasesMap('patient'), _resultSelectedPatients);
            self_.patientsync = _mappedSelectedPatients;
            self_.samplesync = _allSelectedSampleIdsByFilters;
          }
        }

        self_.$nextTick(function () {
          self_.selectedsamples = _resultSelectedSamples;
          self_.selectedpatients = _resultSelectedPatients;
        });
       
      },
      'update-custom-filters': function() {
        if (this.customfilter.type === 'patient') {
          this.patientsync = this.customfilter.patientIds;
          this.samplesync = iViz.util.idMapping(iViz.getCasesMap('patient'),
            this.patientsync);
          this.customfilter.sampleIds = this.samplesync;
        } else {
          this.patientsync = iViz.util.idMapping(iViz.getCasesMap('sample'),
            this.customfilter.sampleIds);
          this.samplesync = this.customfilter.sampleIds;
          this.customfilter.patientIds = this.patientsync;
        }
        
        this.selectedsamples =  this.samplesync;
        this.selectedpatients = this.patientsync;
      }
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/6/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  Vue.component('chartGroup', {
    template: ' <div is="individual-chart"' +
    ' :ndx="ndx" :groupid="groupid"' +
    ' :attributes.sync="attribute" v-for="attribute in attributes"></div>',
    props: [
      'attributes', 'type', 'mappedsamples', 'id',
      'mappedpatients', 'groupid', 'redrawgroups'
    ], created: function() {
      //TODO: update this.data
      var data_ = iViz.getAttrData(this.type);
      var ndx_ = crossfilter(data_);
      var attrId = this.type==='patient'?'patient_id':'sample_id';
      this.invisibleBridgeDimension =  ndx_.dimension(function (d) { return d[attrId]; });
      this.groupid = this.id;
      this.ndx = ndx_;
      this.invisibleChartFilters = [];
    }, destroyed: function() {
      dc.chartRegistry.clear(this.groupid);
    },
    data: function() {
      return {
        syncPatient: true,
        syncSample: true,
        clearGroup:false
      }
    },
    watch: {
      'mappedsamples': function(val) {
        if (this.type === 'sample') {
          if (this.syncSample) {
            this.updateInvisibleChart(val);
          }else {
            this.syncSample = true;
          }
        }
      },
      'mappedpatients': function(val) {
        if (this.type === 'patient') {
          if (this.syncPatient) {
            this.updateInvisibleChart(val);
          } else {
            this.syncPatient = true;
          }
        }
      }
    },
    events: {
      'clear-group':function(){
        this.clearGroup = true;
        this.invisibleBridgeDimension.filterAll();
        this.invisibleChartFilters = [];
        iViz.deleteGroupFilteredCases(this.id);
        this.$broadcast('clear-chart-filters');
        var self_ = this;
        this.$nextTick(function(){
          self_.clearGroup = false;
        });
      },
      'update-filters': function() {
        if(!this.clearGroup){
          this.syncPatient = false;
          this.syncSample = false;
          var _filters = [], _caseSelect = [];
          var attrId = this.type==='patient'?'patient_id':'sample_id';
          if(this.invisibleChartFilters.length>0) {
            this.invisibleBridgeDimension.filterAll();
          }
          var filteredCases = _.pluck(this.invisibleBridgeDimension.top(Infinity),attrId).sort();
          //hackey way to check if filter selected filter cases is same as original case list
          if(filteredCases.length !== this.ndx.size()){
            iViz.setGroupFilteredCases(this.id, filteredCases);
          }else{
            iViz.deleteGroupFilteredCases(this.id)
          }

          if(this.invisibleChartFilters.length>0){
            var filtersMap = {};
            _.each(this.invisibleChartFilters,function(filter){
              if(filtersMap[filter] === undefined){
                filtersMap[filter] = true;
              }
            });
            this.invisibleBridgeDimension.filterFunction(function(d){
              return (filtersMap[d] !== undefined);
            });
          }
          this.$dispatch('update-all-filters', this.type);
        }
      }
    },
    methods: {
      updateInvisibleChart: function(val) {
        this.invisibleChartFilters = val;
        var filtersMap = {};
        if(val.length>0){
          _.each(val,function(filter){
            if(filtersMap[filter] === undefined){
              filtersMap[filter] = true;
            }
          });
          this.invisibleBridgeDimension.filterFunction(function(d){
            return (filtersMap[d] !== undefined);
          });
        }else{
          this.invisibleBridgeDimension.filterAll();
        }
        this.redrawgroups.push(this.id);
      }
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
 *
 */
/**
 * Created by Karthik Kalletla on 4/6/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  Vue.component('individualChart', {
    template: /*'<div v-if="attributes.show">' +*/
    '<component :is="currentView" :groupid="groupid"  v-show="attributes.show"' +
    ' :filters.sync="attributes.filter" v-if="attributes.show" ' +
    ':ndx="ndx" :attributes.sync="attributes"></component>'
    /*'</div>'*/,
    props: [
      'ndx', 'attributes', 'groupid'
    ],
    data: function() {
      var currentView = '';
      switch (this.attributes.view_type) {
        case 'pie_chart':
          currentView = 'pie-chart';
          break;
        case 'bar_chart':
          currentView = 'bar-chart';
          break;
        case 'scatter_plot':
          currentView = 'scatter-plot';
          break;
        case 'survival':
          currentView = 'survival';
          break;
        case 'table':
          currentView = 'table-view';
          break;
      }
      return {
        currentView: currentView
      }
    },
    watch: {
      'attributes.show': function(newVal) {
        if (!newVal)
          this.$dispatch('update-grid',true)
        $("#iviz-add-chart").trigger("chosen:updated");
      }
    },
    events: {
      'close': function () {
        this.attributes.show = false;
        this.$dispatch('remove-chart', this.attributes.attr_id, this.attributes.group_id)
      },
      'clear-chart-filters': function () {
        var _self = this;
        if (_self.attributes.filter.length > 0) {
          _self.attributes.filter = [];
        }
      }
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

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

/**
 * @author Hongxin Zhang on 6/21/16.
 */
(function(iViz, _) {
  // iViz pie chart component. It includes DC pie chart.
  iViz.view.component.GeneralChart = function(chartType) {
    'use strict';
    this.chartType = chartType || 'generalChart';
    this.dataForDownload = {};
    this.getChartType = function() {
      return this.chartType;
    };
    this.setChartType = function(chartType) {
      this.chartType = chartType;
    };
    this.getDownloadData = function(fileType) {
      if (_.isFunction(this.updateDataForDownload)) {
        this.updateDataForDownload(fileType);
      }
      return this.dataForDownload[fileType];
    };
    this.setDownloadData = function(type, content) {
      this.dataForDownload[type] = content;
    };
    this.getDownloadFileTypes = function() {
      return Object.keys(this.dataForDownload);
    };
    this.setDownloadDataTypes = function(types) {
      var _self = this;
      _.each(types, function(type) {
        if (!_self.dataForDownload.hasOwnProperty(type)) {
          _self.dataForDownload[type] = '';
        }
      });
    };
  };
})(window.iViz, window._);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/14/16.
 */
'use strict';
(function(Vue, iViz, $, _) {
  Vue.component('chartOperations', {
    template: '<div class="chart-header">' +
    '<div class="chart-title" :class="[showOperations?chartTitleActive:chartTitle]" v-if="hasChartTitle&&((showTableIcon===undefined)||showTableIcon)"><span class="chart-title-span" id="{{chartId}}-title">{{displayName}}</span></div>' +
    '<div :class="[showOperations?chartOperationsActive:chartOperations]">' +
    '<img v-show="hasFilters" src="images/reload-alt.svg" @click="reset()" class="icon hover"/>' +
    '<div style="float:left" v-if="showLogScale"></input style="float:left"><input type="checkbox" value="" id="" ' +
    'class="bar-x-log" v-model="logChecked">' +
    '<span id="scale-span-{{chartId}}" style="float:left; font-size:10px; margin-right: 15px; color: grey">Log Scale X</span></div>' +
    '<i v-if="showTableIcon" class="fa fa-table icon hover" aria-hidden="true" @click="changeView()"></i>' +
    '<i v-if="showPieIcon" class="fa fa-pie-chart icon hover" aria-hidden="true" @click="changeView()"></i>' +
    '<img v-if="showSurvivalIcon" src="images/survival_icon.svg" class="icon hover"/>' +
    '<div id="{{chartId}}-download-icon-wrapper" class="download">' +
    '<i class="fa fa-download icon hover" alt="download" id="{{chartId}}-download"></i>' +
    '</div>' +
    '<i class="fa fa-arrows dc-chart-drag icon" aria-hidden="true"></i>' +
    '<div style="float:right"><i class="fa fa-times dc-chart-pointer icon" @click="close()"></i></div>' +
    '</div>' +
    '</div>',
    props: [
      'showOperations', 'resetBtnId', 'chart', 'chartCtrl', 'groupid', 'hasChartTitle', 'showTable', 'displayName', 'chartId', 'showPieIcon', 'showTableIcon', 'showLogScale', 'showSurvivalIcon', 'filters'
    ],
    data: function() {
      return {
        chartOperationsActive: 'chart-operations-active',
        chartOperations: 'chart-operations',
        chartTitle: 'chart-title',
        chartTitleActive: 'chart-title-active',
        logChecked: true,
        hasFilters: false
      }
    },
    watch: {
      logChecked: function(newVal, oldVal) {
        this.reset();
        this.$dispatch('changeLogScale', newVal);
      }, filters: function(newVal) {
        this.hasFilters = newVal.length > 0;
      }
    },
    methods: {
      reset: function() {
        if (this.chart.hasOwnProperty('hasFilter')) {
          if (this.filters.length > 0) {
            iViz.shared.resetAll(this.chart, this.groupid)
          }
        } else {
          if (this.filters.length > 0) {
            this.filters = [];
          }
        }
      },
      close: function() {
        if (this.chart.hasOwnProperty('hasFilter')) {
          if (this.filters.length > 0) {
            iViz.shared.resetAll(this.chart, this.groupid)
          }
          dc.deregisterChart(this.chart, this.groupid);
        }
        this.$dispatch('closeChart')
      },
      changeView: function() {
        this.showTableIcon = !this.showTableIcon;
        this.showPieIcon = !this.showPieIcon;
        this.$dispatch('toTableView');
      }
    },
    ready: function() {

      $('#' + this.chartId + '-download').qtip('destroy', true);
      $('#' + this.chartId + '-download-icon-wrapper').qtip('destroy', true);
      var chartId = this.chartId;
      var self = this;

      $('#' + this.chartId + '-title').qtip({
        id: '#' + this.chartId + "-title-qtip",
        content: {text: this.displayName},
        style: {classes: 'qtip-light qtip-rounded qtip-shadow'},
        show: {event: "mouseover"},
        hide: {fixed: true, delay: 100, event: "mouseout"},
        position: {my: 'right bottom', at: 'top left', viewport: $(window)}
      });

      $('#' + this.chartId + '-download-icon-wrapper').qtip({
        style: {classes: 'qtip-light qtip-rounded qtip-shadow'},
        show: {event: "mouseover", delay: 0},
        hide: {fixed: true, delay: 300, event: "mouseout"},
        position: {my: 'bottom left', at: 'top right', viewport: $(window)},
        content: {
          text: "Download"
        }
      });

      $('#' + this.chartId + '-download').qtip({
        id: '#' + this.chartId + "-download-qtip",
        style: {classes: 'qtip-light qtip-rounded qtip-shadow'},
        show: {event: "click", delay: 0},
        hide: {fixed: true, delay: 300, event: "mouseout"},
        position: {my: 'top center', at: 'bottom center', viewport: $(window)},
        content: {
          text: ''
        }, events: {
          show: function() {
            $('#' + chartId + '-download-icon-wrapper').qtip('api').hide();
          },
          render: function(event, api) {
            var downloadFileTypes = self.chartCtrl.getDownloadFileTypes();
            var content = [];
            _.each(downloadFileTypes, function(item) {
              content.push('<div style="display:inline-block;"><button id="' + self.chartId + '-' + item + '" style="width:50px">' + item.toUpperCase() + '</button></div>');
            })

            api.set('content.text', content.join('<br/>'));
            $('#' + chartId + '-pdf', api.elements.tooltip).click(function() {
              iViz.util.download(self.chartCtrl.getChartType(), 'pdf', self.chartCtrl.getDownloadData('pdf'));
            });
            $("#" + chartId + "-svg", api.elements.tooltip).click(function() {
              iViz.util.download(self.chartCtrl.getChartType(), 'svg', self.chartCtrl.getDownloadData('svg'));
            });
            $("#" + chartId + "-tsv").click(function() {
              iViz.util.download(self.chartCtrl.getChartType(), 'tsv', self.chartCtrl.getDownloadData('tsv'));
            });
          }
        }
      });
    }
  });
})(window.Vue, window.iViz,
  window.$ || window.jQuery,
  window._);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/20/16.
 */
'use strict';
(function(Vue, iViz, $, Clipboard) {
  Vue.component('manageCharts', {
    /*template: '<option id="{{attribute.attr_id}}" v-if="!attribute.show" v-for="attribute in data.attributes" value="{{parent}}---{{ $index }}">{{attribute.display_name}}</option>',
     */
    template: '<option id="{{data.attr_id}}" v-if="!data.show" value="{{data.attr_id}}">{{data.display_name}}</option>',
    props: [
      'data'
    ], ready: function() {
      $("#iviz-add-chart").trigger("chosen:updated");
    }
  });
})(window.Vue, window.iViz,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/18/16.
 */
'use strict';
(function(Vue) {
  Vue.component('breadCrumb', {
    template: 
      '<span class="breadcrumb_container" v-if="attributes.filter.length > 0">' +
        '<span>{{attributes.display_name}}</span>' +
        '<span v-if="(filtersToSkipShowing.indexOf(attributes.attr_id) === -1) && (attributes.view_type ! == \'table\')" class="breadcrumb_items">' +
          '<span v-if="filters.filterType === \'RangedFilter\'">' +
            '<span class="breadcrumb_item">{{filters[0]}} -- {{filters[1]}}</span>' +
            '<i class="fa fa-times breadcrumb_remove" @click="removeFilter()"></i>' +
          '</span>' +
          '<template v-else>' +
            '<span v-for="filter in filters" style="display:inline-block;">' +
              '<span v-if="attributes.view_type === \'table\'"  class="breadcrumb_item">{{filter.uniqueId}}</span>' +
              '<span v-else class="breadcrumb_item">{{filter}}</span>' +
              '<i class="fa fa-times breadcrumb_remove" @click="removeFilter(filter)"></i>' +
            '</span>' +
          '</template>' +
        '</span>' +
        '<template v-else>' +
          '<i class="fa fa-times breadcrumb_remove" @click="removeFilter()"></i>' +
        '</template>' +
      '</span>',
    props: [
      'filters', 'attributes'
    ], data: function() {
      return {
        filtersToSkipShowing:['MUT_CNT_VS_CNA','sample_id','patient_id']
      }
    },
    watch: {
      'filters': function(val) {
      }
    },
    methods: {
      removeFilter: function(val) {
        if (this.attributes.view_type === 'bar_chart') {
          this.filters = [];
        } else if(this.attributes.view_type === 'pie_chart'){
          if(this.filtersToSkipShowing.indexOf(this.attributes.attr_id) !== -1){
            this.filters = [];
          }else{
            this.filters.$remove(val);
          }
        } else if(this.attributes.view_type === 'scatter_plot'){
          this.filters = [];
        }else if(this.attributes.view_type === 'table'){
          this.filters = [];
        /*  var filters_ = $.extend(true,[],this.filters);
          filters_ = _.reject(filters_, function(el) { return el.uniqueId === val.uniqueId; });
          this.filters = filters_;*/
        }
      }
    }
  });
})(window.Vue);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

/**
 * @author Hongxin Zhang on 3/10/16.
 */

'use strict';
(function(iViz, dc, _, $) {
  // iViz pie chart component. It includes DC pie chart.
  iViz.view.component.PieChart = function(ndx, attributes, opts, cluster) {
    var content = this;
    var v = {};

    v.chart = '';

    v.data = {
      color: $.extend(true, [], iViz.util.getColors()),
      category: ''
    };

    /* HTML options*/
    v.opts = {};

    v.opts = $.extend(true, v.opts, opts);
    v.data = $.extend(true, v.data, attributes);
    v.data.ndx = ndx;
    
    var labels = [];
    var currentSampleSize = 0;
    var reactTableData = {};
    var pieLabelTableInitialized = false;
    var tableInitialized = false;
    var labelMetaData = [];
    var maxLabelValue = 0;
    var currentView = 'pie';
    var updateQtip = true;

    initDCPieChart();
    
    content.getChart = function() {
      return v.chart;
    };

    content.changeView = function(vm,toTableView){
      currentView = toTableView?'table':'pie';
      var chartDivDom = $("#"+v.opts.charDivId);
      chartDivDom.css('z-index', 16000);

      //qtip wont be needed in table view
      chartDivDom.qtip('destroy', true);

      if(currentView === 'table'){
        if ( !tableInitialized ) {
          initReactTable(v.opts.chartTableId, reactTableData);
          tableInitialized = true;
        }else{
          updateReactTable();
        }
        animateTable("#"+v.opts.charDivId, 'table', function() {
          vm.$dispatch('update-grid');
          $("#"+v.opts.charDivId).css('z-index', '');
        });
      }else{
        animateTable("#"+v.opts.charDivId, 'pie', function() {
          vm.$dispatch('update-grid');
          $("#"+v.opts.charDivId).css('z-index', '1');
        });
        content.initMainDivQtip();
      }
    };

    content.initMainDivQtip = function(){
      $('#' +v.opts.charDivId).qtip({
        id: v.opts.charDivId+'-qtip',
        style: {
          classes: 'qtip-light qtip-rounded qtip-shadow forceZindex qtip-max-width iviz-pie-qtip iviz-pie-label-qtip'
        },
        show: {event: "mouseover", solo: true, delay: 0, ready: true},
        hide: {fixed:true, delay: 300, event: "mouseleave"},
        // hide: false,
        position: {my:'left center',at:'center right', viewport: $(window)},
        content: '<div id="qtip-' + v.opts.charDivId + '-content-react">Loading....</div>',
        events: {
          show:function(event){
            if(updateQtip){
              labelMetaData = [];
              updateQtip = false;
              updatePieLabels();
            }
          },
          render: function() {
            updateCurrentLabels();
            initReactData();
            var data = $.extend(true, {}, reactTableData);
            data.attributes[0].column_width = 140;
            initReactTable('qtip-' + v.opts.charDivId + '-content-react',
              data, {
                tableWidth: 300,
                pieLabelMouseEnterFunc: pieLabelMouseEnter,
                pieLabelMouseLeaveFunc: pieLabelMouseLeave
              });
            pieLabelTableInitialized = true;
          }
        }
      });
    };

    content.updateDataForDownload = function(fileType) {
      if (fileType === 'tsv') {
        initTsvDownloadData();
      } else if (['pdf', 'svg'].indexOf(fileType) !== -1) {
        initCanvasDownloadData();
      }
    }

    /**
     * This is the function to initialize dc pie chart instance.
     */
    function initDCPieChart() {
      if (v.opts.hasOwnProperty('chartId') &&
        v.data.hasOwnProperty('ndx') &&
        v.data.hasOwnProperty('attr_id')) {
        var width = v.opts.width || 130;
        var height = v.opts.height;
        var radius = (width - 20) / 2;
        var color = $.extend(true, [], v.data.color);

        v.chart = dc.pieChart('#' + v.opts.chartId, v.opts.groupid);

        v.data.attrKeys = cluster.group().all().map(function(d) {
          return d.key;
        });

        v.data.category = iViz.util.pieChart.getCategory(v.data.attr_id,
          v.data.attrKeys);

        v.data.attrKeys.sort(function(a, b) {
          return a < b ? -1 : 1;
        });

        var NAIndex = v.data.attrKeys.indexOf('NA');
        if (NAIndex !== -1) {
          color.splice(NAIndex, 0, '#CCCCCC');
        }

        v.chart
          .width(width)
          .height(height)
          .radius(radius)
          .dimension(cluster)
          .group(cluster.group())
          .transitionDuration(v.opts.transitionDuration || 400)
          .ordinalColors(color)
          .label(function(d) {
            return d.value;
          })
          .ordering(function(d) {
            return d.key;
          });
        v.chart.on("postRender",function(){
          //TODO:commented this because this is taking much time to load chart, need to find different way
          //initLabels();
         // initReactData();
        });
        v.chart.on("preRedraw",function(){
          removeMarker();
        });
        v.chart.on("postRedraw",function(){
          if ( $("#"+v.opts.charDivId).length ) {
            //TODO:commented this because this is taking much time to redraw after applying filter, need to find different way
            updateQtip = true;
          //  updatePieLabels();
          }
        });
      } else {
        // TODO:
        /**
         * Need a handler if no dimension ID passed.
         */
      }
    }

    function initTsvDownloadData() {
      var data = v.data.display_name + '\tCount';

      var meta = labels || [];
      
      for (var i = 0; i < meta.length; i++) {
        data += '\r\n';
        data += meta[i].name + '\t';
        data += meta[i].samples;
      }
      content.setDownloadData('tsv', {
        fileName: v.data.display_name || 'Pie Chart',
        data: data
      });
    }

    function initCanvasDownloadData() {
      content.setDownloadData('svg', {
        title: v.data.display_name,
        chartDivId: v.opts.charDivId,
        chartId: v.opts.chartId,
        fileName: v.data.display_name,
        labels: labels
      });
      content.setDownloadData('pdf', {
        title: v.data.display_name,
        chartDivId: v.opts.charDivId,
        chartId: v.opts.chartId,
        fileName: v.data.display_name,
        labels: labels
      });
    }

    function animateTable(target, view, callback) {
      var width = window.style['grid-w-1'] || '180px';
      var height = window.style['grid-h-1'] || '165px';

      if (view === 'table') {
        width = window.style['grid-w-2'] || '375px';
        height = window.style['grid-h-2'] || '340px';
      }

      $(target).animate({
        height: height,
        width: width,
        duration: 300,
        queue: false
      }, 300, function() {
        if (_.isFunction(callback)) {
          callback();
        }
      });
    }

    function initLabels() {
      labelMetaData = initLabelInfo();
      labels = $.extend(true, [], labelMetaData);
    }

    function initLabelInfo() {
      var _labelID = 0;
      var _labels = [];
      currentSampleSize = 0;

      $('#' + v.opts.chartId + '>svg>g>g').each(function(){
        var _labelDatum = {};
        var _labelText = $(this).find('title').text();
        var _color = $(this).find('path').attr('fill');
        var _pointsInfo = $(this).find('path').attr('d').split(/[\s,MLHVCSQTAZ]/);
        var _labelName = _labelText.substring(0, _labelText.lastIndexOf(":"));
        var _labelValue = Number(_labelText.substring(_labelText.lastIndexOf(":")+1).trim());

        if(_pointsInfo.length >= 10){

          var _x1 = Number( _pointsInfo[1] ),
            _y1 = Number( _pointsInfo[2] ),
            _x2 = Number( _pointsInfo[8] ),
            _y2 = Number( _pointsInfo[9] );

          if(Math.abs(_x1 - _x2) > 0.01 || Math.abs(_y1 - _y2) > 0.01){
            _labelDatum.id = _labelID;
            _labelDatum.name = _labelName;
            _labelDatum.color = _color;
            _labelDatum.parentID = v.opts.chartId;
            _labelDatum.samples = _labelValue;
            currentSampleSize += _labelValue;

            if(maxLabelValue < _labelValue) {
              maxLabelValue = _labelValue;
            }
            _labels.push(_labelDatum);
          }
          _labelID++;
        }else{
          // StudyViewUtil.echoWarningMessg("Initial Label Error");
        }
        _.each(_labels, function(label) {
          label.sampleRate = ( currentSampleSize <= 0 ? 0 : (Number(label.samples) * 100 / currentSampleSize).toFixed(1).toString()) + '%'
        });
      });

      return _labels;
    }

    function updatePieLabels() {
      updateCurrentLabels();
      initReactData();
      updateTables();
    }

    function updateTables() {
      if(pieLabelTableInitialized && currentView === 'pie') {
        updateQtipReactTable();
      }
      if(tableInitialized && currentView === 'table') {
        updateReactTable();
      }
    }

    function updateReactTable() {
      var data = $.extend(true, {}, reactTableData);
      initReactTable(v.opts.chartTableId, data);
    }

    function updateQtipReactTable() {
      var data = $.extend(true, {}, reactTableData);
      data.attributes[0].column_width = 140;
      initReactTable('qtip-' + v.opts.charDivId + '-content-react', data, {
        tableWidth: 300,
        pieLabelMouseEnterFunc: pieLabelMouseEnter,
        pieLabelMouseLeaveFunc: pieLabelMouseLeave
      });
    }


    function updateCurrentLabels() {
      labels = filterLabels();
    }

    function findLabel(labelName) {
      if(labelMetaData.length===0){
        initLabels();
      }
      for (var i = 0; i < labelMetaData.length; i++) {
        if (labelMetaData[i].name === labelName) {
          return labelMetaData[i];
        }
      }
      return '';
    }

    function filterLabels() {
      var _labels = [];
      currentSampleSize = 0;

      $('#' + v.opts.chartId + '>svg>g>g').each(function(){
        var _labelText = $(this).find('title').text();
        var _pointsInfo = $(this).find('path').attr('d').split(/[\s,MLHVCSQTAZ]/);
        var _labelName = _labelText.substring(0, _labelText.lastIndexOf(":"));
        var _labelValue = Number(_labelText.substring(_labelText.lastIndexOf(":")+1).trim());

        if(_pointsInfo.length >= 10){

          var _x1 = Number( _pointsInfo[1] ),
            _y1 = Number( _pointsInfo[2] ),
            _x2 = Number( _pointsInfo[8] ),
            _y2 = Number( _pointsInfo[9] );

          if(Math.abs(_x1 - _x2) > 0.01 || Math.abs(_y1 - _y2) > 0.01){
            var _label = findLabel(_labelName);
            if(_label) {
              _label.samples = _labelValue;
              currentSampleSize += _labelValue;
              _labels.push(_label);
            }

            if(maxLabelValue < _labelValue) {
              maxLabelValue = _labelValue;
            }
          }
        }else{
          //StudyViewUtil.echoWarningMessg("Initial Label Error");
        }
      });

      return _labels;
    }

    function initReactData() {
      var result = {
        data: [],
        attributes: [
          {
            "attr_id": "name",
            "display_name": v.data.display_name,
            "datatype": "STRING",
            "column_width": 213
          },
          {
            "attr_id": "color",
            "display_name": "Color",
            "datatype": "STRING",
            "show": false
          },
          {
            "attr_id": "samples",
            "display_name": "#",
            "datatype": "NUMBER",
            "column_width": 70
          },
          {
            "attr_id": "sampleRate",
            "display_name": "Freq",
            "datatype": "PERCENTAGE",
            "column_width": 90
          },
          {
            "attr_id": "caseIds",
            "display_name": "Cases",
            "datatype": "STRING",
            "show": false
          },
          {
            "attr_id": "uniqueId",
            "display_name": "uniqueId",
            "datatype": "STRING",
            "show": false
          }
        ]
      };

      _.each(labels, function(item, index) {
        for (var key in item) {
          var datum = {
            'attr_id': key,
            'uniqueId': item.id,
            'attr_val': item[key]
          };
          result.data.push(datum);
        }
      });

      reactTableData = result;
    }

    function removeMarker() {
      $("#" + v.opts.chartId).find('svg g .mark').remove();
    }

    function drawMarker(_childID,_fatherID) {
      var _pointsInfo =
        $('#' + v.opts.chartId + ' svg>g>g:nth-child(' + _childID+')')
          .find('path')
          .attr('d')
          .split(/[\s,MLHVCSQTAZ]/);

      var _pointsInfo1 =
        $('#' + v.opts.chartId + ' svg>g>g:nth-child(' + _childID+')')
          .find('path')
          .attr('d')
          .split(/[A]/);

      var _fill =
        $('#' + v.opts.chartId + ' svg>g>g:nth-child(' + _childID+')')
          .find('path')
          .attr('fill');

      var _x1 = Number(_pointsInfo[1]),
        _y1 = Number(_pointsInfo[2]),
      //_largeArc = Number(_pointsInfo[6]),
        _x2 = Number(_pointsInfo[8]),
        _y2 = Number(_pointsInfo[9]),
        _r = Number(_pointsInfo[3]);

      if((_x1 - _x2!==0 || _y1 - _y2!==0) && _pointsInfo1.length === 2){
        var _pointOne = Math.atan2(_y1,_x1);
        var _pointTwo = Math.atan2(_y2,_x2);

        if(_pointOne < -Math.PI/2){
          _pointOne = Math.PI/2 + Math.PI *2 +_pointOne;
        }else{
          _pointOne = Math.PI/2 +_pointOne;
        }

        if(_pointTwo < -Math.PI/2){
          _pointTwo = Math.PI/2 + Math.PI*2 +_pointTwo;
        }else{
          _pointTwo = Math.PI/2 +_pointTwo;
        }

        //The value of point two should always bigger than the value
        //of point one. If the point two close to 12 oclick, we should
        //change it value close to 2PI instead of close to 0
        if(_pointTwo > 0 && _pointTwo < 0.0000001){
          _pointTwo = 2*Math.PI-_pointTwo;
        }

        if(_pointTwo < _pointOne){
          console.log('%cError: the end angle should always bigger' +
            ' than start angle.', 'color: red');
        }

        var _arcID = "arc-" +_fatherID+"-"+(Number(_childID)-1);
        var _arc = d3.svg.arc()
          .innerRadius(_r + 3)
          .outerRadius(_r + 5)
          .startAngle(_pointOne)
          .endAngle(_pointTwo);

        d3.select("#" + v.opts.chartId + " svg g").append("path")
          .attr("d", _arc)
          .attr('fill',_fill)
          .attr('id',_arcID)
          .attr('class','mark');
      }
    }

    function pieLabelMouseEnter(data) {
      var childID = Number(data.id) + 1,
        fatherID = v.opts.chartId;

      $('#' + v.opts.chartId + ' svg>g>g:nth-child(' + childID+')').css({
        'fill-opacity': '.5',
        'stroke-width': '3'
      });

      drawMarker(childID,fatherID);
    }

    function pieLabelMouseLeave(data) {
      var childID = Number(data.id) + 1,
        fatherID = v.opts.chartId,
        arcID = fatherID+"-"+(Number(childID)-1);

      $("#" + v.opts.chartId + " svg g #arc-" + arcID).remove();

      $('#' + v.opts.chartId + ' svg>g>g:nth-child(' + childID+')').css({
        'fill-opacity': '1',
        'stroke-width': '1px'
      });
    }

    function initReactTable(targetId, inputData, opts) {
      var _filters = v.chart.filters();
      var selectedRows = _.map(_.filter(labels, function(item) {
        return _.contains(_filters, item.name);
      }), function(item) {
        return item.id.toString();
      });

      var opts_ = $.extend({
        input: inputData,
        filter: "ALL",
        download: "NONE",
        downloadFileName: "data.txt",
        showHide: false,
        hideFilter: true,
        scroller: true,
        resultInfo: false,
        groupHeader: false,
        fixedChoose: false,
        uniqueId: 'uniqueId',
        rowHeight: 25,
        tableWidth: 373,
        maxHeight: 290,
        headerHeight: 26,
        groupHeaderHeight: 40,
        autoColumnWidth: false,
        columnMaxWidth: 300,
        columnSorting: false,
        tableType: 'pieLabel',
        selectedRows: selectedRows,
        rowClickFunc: pieLabelClick
      }, opts);

      var testElement = React.createElement(EnhancedFixedDataTableSpecial, opts_);

      ReactDOM.render(testElement, document.getElementById(targetId));
    }

    function pieLabelClick(selectedData, selected, allSelectedData) {
      var childaLabelID = Number(selectedData.id),
        childID = childaLabelID + 1;

      var arcID =  v.opts.chartId + "-" + (Number(childID) - 1);

      v.chart.onClick({
        key: labelMetaData[childaLabelID].name,
        value: labelMetaData[childaLabelID].value
      });
      $("#" + v.opts.chartId + " svg g #" + arcID).remove();

      $('#' + v.opts.chartId + ' svg>g>g:nth-child(' + childID + ')').css({
        'fill-opacity': '1',
        'stroke-width': '1px'
      });
    }
  };

  iViz.view.component.PieChart.prototype = new iViz.view.component.GeneralChart('pieChart');
  iViz.view.component.PieChart.constructor = iViz.view.component.PieChart;

  // Utils designed for pie chart.
  iViz.util.pieChart = (function() {
    var util = {};
    var v = {};

    v.category = ['w1', 'h1']; // Size class name for chart

    v.labelLT = 5; // Label length threshold
    v.labelHeaderLT = 4; // Label header length threshold

    // If the name lenght bigger the threshold, it will be truncated.
    v.labelWLT = 30; // Label length threshold for wider table
    v.labelHeaderWLT = 20; // Label header length threshold for wider table

    util.getCategory = function(attr, attrKeys) {
      var category = $.extend(true, {}, v.category);
      var maxAttrL = 0;

      _.each(attrKeys, function(key) {
        if (key.length > maxAttrL) {
          maxAttrL = key.length;
        }
      });

      category[0] = maxAttrL <= v.labelLT ? 'w1' : 'w2';

      // Default settings for special attribtues.
      if (['CANCER_TYPE', 'CANCER_TYPE_DETAILED'].indexOf(attr) !== -1) {
        category[0] = 'w2';
      }

      category[1] = attrKeys.length > 10 ? 'h2' : 'h1';

      return category;
    };

    return util;
  })();
})(window.iViz,
  window.dc,
  window._,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/6/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {

  Vue.component('pieChart', {
    template: '<div id={{charDivId}} class="grid-item grid-item-h-1 grid-item-w-1" ' +
              '@mouseenter="mouseEnter($event)" @mouseleave="mouseLeave($event)">' +
              '<chart-operations :has-chart-title="hasChartTitle" :display-name="displayName" :show-table-icon.sync="showTableIcon" ' +
              ' :show-pie-icon.sync="showPieIcon" :chart-id="chartId" :show-operations="showOperations" :groupid="groupid" ' +
              ':reset-btn-id="resetBtnId" :chart-ctrl="piechart" :chart="chartInst" :filters.sync="filters" :attributes="attributes"></chart-operations>' +
              '<div class="dc-chart dc-pie-chart" :class="{view: showPieIcon}" align="center" style="float:none' +
              ' !important;" id={{chartId}} ></div>' +
              '<div id={{chartTableId}} :class="{view: showTableIcon}"></div>'+
              '</div>',
    props: [
      'ndx', 'attributes', 'filters', 'groupid','options'
    ],
    data: function() {
      return {
        v: {},
        charDivId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-div',
        resetBtnId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-reset',
        chartId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, ""),
        chartTableId : 'table-'+ this.attributes.attr_id.replace(/\(|\)| /g, ""),
        displayName: this.attributes.display_name,
        chartInst: '',
        component: '',
        showOperations: false,
        cluster: '',
        piechart:'',
        hasChartTitle:true,
        showTableIcon:true,
        showPieIcon:false,
        filtersUpdated:false
      }
    },
    watch: {
      'filters': function(newVal, oldVal) {
        if(!this.filtersUpdated) {
          this.filtersUpdated = true;
          if (newVal.length === 0) {
            this.chartInst.filterAll();
          }else{
            if (newVal.length === oldVal.length) {
                this.chartInst.filter(newVal);
            }
            else{
              var temp = newVal.length > 1? [newVal]: newVal;
              this.chartInst.replaceFilter(temp);
            }
          }
          dc.redrawAll(this.groupid);
          this.$dispatch('update-filters');
        }else{
          this.filtersUpdated = false;
        }
      }
    },
    events: {
      'toTableView': function() {
        this.piechart.changeView(this, !this.showTableIcon);
      },
      'closeChart':function(){
        $('#' +this.charDivId).qtip('destroy');
        this.$dispatch('close');
      }
    },
    methods: {
      mouseEnter: function(event) {
        this.showOperations = true;
        this.$emit('initMainDivQtip');
      }, mouseLeave: function(event) {
        if(event.relatedTarget===null){
          this.showOperations = false;
        }
        if((event.relatedTarget!==null)&&(event.relatedTarget.nodeName!=='CANVAS')){
          this.showOperations = false;
        }
      },initMainDivQtip : function(){
        this.piechart.initMainDivQtip();
      }
    },
    ready: function() {
      
      var _self = this;

      // check if there's data for this attribute  
      //var _hasData = false;
      var _attrId = _self.attributes.attr_id;
      var _cluster = _self.ndx.dimension(function(d) {
        if (typeof d[_attrId] === 'undefined') d[_attrId] = 'NA';
        return d[_attrId];
      });
      
        _self.$once('initMainDivQtip', _self.initMainDivQtip);
        var opts = {
          chartId : _self.chartId,
          charDivId : _self.charDivId,
          groupid : _self.groupid,
          chartTableId : _self.chartTableId,
          transitionDuration : iViz.opts.dc.transitionDuration,
          width: window.style['piechart-svg-width'] | 130,
          height: window.style['piechart-svg-height'] | 130
        };
        _self.piechart = new iViz.view.component.PieChart(_self.ndx, _self.attributes, opts, _cluster);
        _self.piechart.setDownloadDataTypes(['tsv', 'pdf', 'svg']);
        _self.chartInst = _self.piechart.getChart();
        _self.chartInst.on('filtered', function(_chartInst, _filter) {
          if(!_self.filtersUpdated) {
            _self.filtersUpdated = true;
            var tempFilters_ = $.extend(true, [], _self.filters);
            tempFilters_ = iViz.shared.updateFilters(_filter, tempFilters_,
              _self.attributes.view_type);
            _self.filters = tempFilters_;
            _self.$dispatch('update-filters');
          }else{
            _self.filtersUpdated = false;
          }
        });
        _self.$dispatch('data-loaded', true);
      
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

'use strict';
(function(iViz, dc, _, $, d3) {
  // iViz pie chart component. It includes DC pie chart.
  iViz.view.component.BarChart = function() {
    var content = this;

    var chartInst_;// DC chart instance.
    var opts_ = {};// Chart configuration options
    var data_ = {};// Chart related data. Such as attr_id.
    var colors_;
    var ndx_;
    var hasEmptyValue_ = false;

    /**
     * Create DC chart with linear scale.
     * @private
     */
    var regularDc_ = function() {
      var tickVal = [];
      var barColor = {};

      var cluster = ndx_.dimension(function(d) {
        var val = d[data_.attrId];
        if (typeof val === 'undefined' || val === 'NA' || val === '' || val === 'NaN') {
          hasEmptyValue_ = true;
          val = opts_.emptyMappingVal;
        } else {
          val = d[data_.attrId] >= 0 ? parseInt(
            (d[data_.attrId] - opts_.startPoint) /
            opts_.gutter, 10) *
          opts_.gutter + opts_.startPoint + opts_.gutter / 2 :
          (parseInt(
            d[data_.attrId] /
            opts_.gutter, 10) - 1) *
          opts_.gutter + opts_.gutter / 2;
        }

        if (tickVal.indexOf(val) === -1) {
          tickVal.push(Number(val));
        }

        return val;
      });

      tickVal.sort(function(a, b) {
        return a < b ? -1 : 1;
      });

      var tickL = tickVal.length - 1;

      for (var i = 0; i < tickL; i++) {
        barColor[tickVal[i]] = colors_[i];
      }

      if (hasEmptyValue_) {
        opts_.xDomain.push(Number(
          iViz.util.toPrecision(
            Number(opts_.emptyMappingVal), 3, 0.1)
          )
        );
        barColor.NA = '#CCCCCC';
      } else {
        barColor[tickVal[tickL]] = colors_[tickL];
      }

      chartInst_
        .width(opts_.width)
        .height(opts_.height)
        .margins({top: 10, right: 20, bottom: 30, left: 40})
        .dimension(cluster)
        .group(cluster.group())
        .centerBar(true)
        .elasticY(true)
        .elasticX(false)
        .turnOnControls(true)
        .mouseZoomable(false)
        .brushOn(true)
        .transitionDuration(iViz.opts.transitionDuration || 400)
        .renderHorizontalGridLines(false)
        .renderVerticalGridLines(false);

      chartInst_.x(d3.scale.linear()
        .domain([
          opts_.xDomain[0] - opts_.gutter,
          opts_.xDomain[opts_.xDomain.length - 1] + opts_.gutter
        ]));

      chartInst_.yAxis().ticks(6);
      chartInst_.yAxis().tickFormat(d3.format('d'));
      chartInst_.xAxis().tickFormat(function(v) {
        return v === opts_.emptyMappingVal ? 'NA' : v;
      });

      chartInst_.xAxis().tickValues(opts_.xDomain);
      //chartInst_.xAxisLabel(data_.displayName);
      chartInst_.xUnits(function() {
        return opts_.xDomain.length * 1.3 <= 5 ? 5 : opts_.xDomain.length * 1.3;
      });
    };

    /**
     * Create DC chart with log scale.
     * @private
     */
    var logDc_ = function() {
      var _domainLength,
        _maxDomain = 10000;

      var emptyValueMapping = "1000";//Will be changed later based on maximum
      // value
      var xDomain = [];

      for (var i = 0; ; i += 0.5) {
        var _tmpValue = parseInt(Math.pow(10, i));

        xDomain.push(_tmpValue);
        if (_tmpValue > data_.max) {

          emptyValueMapping = Math.pow(10, i + 0.5);
          xDomain.push(emptyValueMapping);
          _maxDomain = Math.pow(10, i + 1);
          break;
        }
      }

      _domainLength = xDomain.length;

      var tickVal = [];
      var barColor = {};

      var cluster = ndx_.dimension(function(d) {

        var i, val = Number(d[data_.attrId]);

        if (isNaN(val)) {
          hasEmptyValue_ = true;
          val = emptyValueMapping;
        } else {
          for (i = 1; i < _domainLength; i++) {
            if (d[data_.attrId] < xDomain[i] &&
              d[data_.attrId] >= xDomain[i - 1]) {

              val = parseInt(Math.pow(10, i / 2 - 0.25));
            }
          }
        }

        if (tickVal.indexOf(val) === -1) {
          tickVal.push(Number(val));
        }

        return val;
      });

      tickVal.sort(function(a, b) {
        return a < b ? -1 : 1;
      });

      var tickL = tickVal.length - 1;

      for (var i = 0; i < tickL; i++) {
        barColor[tickVal[i]] = colors_[i];
      }

      if (hasEmptyValue_) {
        barColor.NA = '#CCCCCC';
      } else {
        barColor[tickVal[tickL]] = colors_[tickL];
      }

      chartInst_
        .width(opts_.width)
        .height(opts_.height)
        .margins({top: 10, right: 20, bottom: 30, left: 40})
        .dimension(cluster)
        .group(cluster.group())
        .centerBar(true)
        .elasticY(true)
        .elasticX(false)
        .turnOnControls(true)
        .mouseZoomable(false)
        .brushOn(true)
        .transitionDuration(iViz.opts.transitionDuration || 400)
        .renderHorizontalGridLines(false)
        .renderVerticalGridLines(false);

      chartInst_.x(d3.scale.log().nice()
        .domain([0.7, _maxDomain]));

      chartInst_.yAxis().ticks(6);
      chartInst_.yAxis().tickFormat(d3.format('d'));
      chartInst_.xAxis().tickFormat(function(v) {
        var _returnValue = v;
        if (v === emptyValueMapping) {
          _returnValue = 'NA';
        } else {
          var index = xDomain.indexOf(v);
          if (index % 2 === 0) {
            return v.toString();
          } else {
            return '';
          }
        }
        return _returnValue;
      });

      chartInst_.xAxis().tickValues(xDomain);
      //chartInst_.xAxisLabel(data_.displayName);
      chartInst_.xUnits(function() {
        return xDomain.length * 1.3 <= 5 ? 5 : xDomain.length * 1.3;
      });
    };

    function initTsvDownloadData() {
      var data = '';
      var _cases = chartInst_.dimension().top(Infinity);

      data = 'Sample ID\tPatient ID\t' + data_.displayName;

      for (var i = 0; i < _cases.length; i++) {
        data += '\r\n';
        data += _cases[i].sample_id + '\t';
        data += _cases[i].patient_id + '\t';
        data += iViz.util.restrictNumDigits(_cases[i][data_.attrId]);
      }
      content.setDownloadData('tsv', {
        fileName: data_.displayName,
        data: data
      });
    }

    function initCanvasDownloadData() {
      content.setDownloadData('svg', {
        title: data_.displayName,
        chartDivId: opts_.chartDivId,
        chartId: opts_.chartId,
        fileName: data_.displayName
      });
      content.setDownloadData('pdf', {
        title: data_.displayName,
        chartDivId: opts_.chartDivId,
        chartId: opts_.chartId,
        fileName: data_.displayName
      });
    }

    content.hasLogScale = function() {
      if (data_ !== undefined) {
        if (data_.min !== null && data_.max !== null) {
          return ((data_.max - data_.min) > 1000) && (data_.min > 1) ? true : false;
        }
      }
      return false;
    };

    content.init = function(ndx, opts) {
      //TODO: need to update logic of getting min and max
      var data = iViz.getAttrData(opts.group_type);
      data_.meta = _.map(_.filter(_.pluck(data, opts.attrId), function(d) {
        return d !== 'NA';
      }), function(d) {
        return parseFloat(d);
      });
      data_.min = d3.min(data_.meta);
      data_.max = d3.max(data_.meta);
      opts_ = iViz.util.barChart.getDcConfig({
        min: d3.min(data_.meta),
        max: d3.max(data_.meta)
      });
      data_.attrId = opts.attrId;
      data_.displayName = opts.displayName;
      opts_.width = opts.width;
      opts_.height = opts.height;
      opts_.chartDivId = opts.chartDivId;
      opts_.chartId = opts.chartId;
      ndx_ = ndx;
      hasEmptyValue_ = false;

      colors_ = $.extend(true, {}, iViz.util.getColors());

      chartInst_ = dc.barChart('#' + opts.chartId, opts.groupid);

      if (opts.logScaleChecked !== undefined) {
        if (opts.logScaleChecked) {
          logDc_();
        } else {
          regularDc_();
        }
      } else {
        if (((data_.max - data_.min) > 1000) && (data_.min > 0.1)) {
          logDc_();
        } else {
          regularDc_();
        }
      }
      chartInst_.render();
      return chartInst_;
    };

    content.redraw = function(logScaleChecked) {
      if (logScaleChecked) {
        regularDc_();
      } else {
        logDc_();
      }
    };

    content.updateDataForDownload = function(fileType) {
      if (fileType === 'tsv') {
        initTsvDownloadData();
      } else if (['pdf', 'svg'].indexOf(fileType) !== -1) {
        initCanvasDownloadData();
      }
    }
    // return content;
  };

  iViz.view.component.BarChart.prototype = new iViz.view.component.GeneralChart('barChart');
  iViz.view.component.BarChart.constructor = iViz.view.component.BarChart;

  iViz.util.barChart = (function() {
    var content = {};

    /**
     * Customize the bar chart configuration options according to
     * the data range.
     * @param {object} data Data should inlude two parameters: min and max. They should all be number.
     * @return {{xDomain: Array, divider: number, numOfGroups: number, emptyMappingVal: string, gutter: number, startPoint: number, maxVal: string}} The customized configure options.
     */
    content.getDcConfig = function(data) {
      var config = {
        xDomain: [],
        divider: 1,
        numOfGroups: 10,
        emptyMappingVal: '',
        gutter: 0.2,
        startPoint: -1,
        maxVal: ''
      };

      if (!_.isUndefined(data.min) && !_.isUndefined(data.max)) {
        var max = data.max;
        var min = data.min;
        var range = max - min;
        var rangeL = parseInt(range, 10).toString().length - 2;
        var i = 0;

        // Set divider based on the number m in 10(m)
        for (i = 0; i < rangeL; i++) {
          config.divider *= 10;
        }

        if (max < 100 &&
          max > 50) {
          config.divider = 10;
        } else if (max < 100 &&
          max > 30) {
          config.divider = 5;
        } else if (max < 100 &&
          max > 10) {
          config.divider = 2;
        }

        if (max <= 1 && max > 0 && min >= -1 && min < 0) {
          config.maxVal = (parseInt(max / config.divider, 10) + 1) * config.divider;
          config.gutter = 0.2;
          config.startPoint = (parseInt(min / 0.2, 10) - 1) * 0.2;
          config.emptyMappingVal = config.maxVal + 0.2;
        } else if (range <= 1 && min >= 0 && max <= 1) {
          config.gutter = 0.1;
          config.startPoint = 0;
          config.emptyMappingVal = 1.1;
        } else if (range >= 1) {
          config.gutter = (parseInt(range / (config.numOfGroups * config.divider), 10) + 1) * config.divider;
          config.maxVal = (parseInt(max / config.gutter, 10) + 1) * config.gutter;
          config.startPoint = parseInt(min / config.gutter, 10) * config.gutter;
          config.emptyMappingVal = config.maxVal + config.gutter;
        } else {
          config.gutter = 0.1;
          config.startPoint = -1;
          config.emptyMappingVal = config.maxVal + 0.1;
        }

        for (i = 0; i <= config.numOfGroups; i++) {
          var _tmpValue = i * config.gutter + config.startPoint;

          _tmpValue = Number(iViz.util.toPrecision(Number(_tmpValue), 3, 0.1));

          // If the current _tmpValue already bigger than maximum number, the
          // function should decrease the number of bars and also reset the
          // mapped empty value.
          if (_tmpValue > max) {
            // if i = 0 and tmpValue bigger than maximum number, that means
            // all data fall into NA category.
            if (i !== 0) {
              config.xDomain.push(_tmpValue);
            }
            // Reset the empty mapping value
            if (range > 1000 || range < 1) {
              config.emptyMappingVal = (i + 1) * config.gutter + config.startPoint;
            }

            // If the distance of Max and Min value is smaller than 1, give
            // a more precise value
            if (range < 1) {
              config.emptyMappingVal = Number(iViz.util.toPrecision(Number(config.emptyMappingVal), 3, 0.1));
            }

            break;
          } else {
            config.xDomain.push(_tmpValue);
          }
        }
      }
      return config;
    };
    return content;
  })();
})(window.iViz,
  window.dc,
  window._,
  window.$ || window.jQuery,
  window.d3);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 4/6/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  var settings_ = {
    pieChart: {
      width: 150,
      height: 150,
      innerRadius: 15
    },
    barChart: {
      width: 400,
      height: 180
    },
    transitionDuration: iViz.opts.dc.transitionDuration
  };

  Vue.component('barChart', {
    template: '<div id={{charDivId}} class="grid-item grid-item-w-2 grid-item-h-1 bar-chart" @mouseenter="mouseEnter" @mouseleave="mouseLeave">' +
    '<chart-operations :show-log-scale="showLogScale"' +
    ':show-operations="showOperations" :groupid="groupid" :reset-btn-id="resetBtnId" :chart-ctrl="barChart" :chart="chartInst" :chart-id="chartId" :show-log-scale="showLogScale" :filters.sync="filters"></chart-operations>' +
    '<div class="dc-chart dc-bar-chart" align="center" style="float:none !important;" id={{chartId}} ></div><span class="text-center chart-title-span">{{displayName}}</span>' +
    '</div>',
    props: [
      'ndx', 'attributes', 'filters', 'groupid'
    ],
    data: function() {
      return {
        chartDivId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") +
        '-div',
        resetBtnId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") +
        '-reset',
        chartId: 'chart-new-' + this.attributes.attr_id.replace(/\(|\)| /g, ""),
        displayName: this.attributes.display_name,
        chartInst:'',
        barChart:'',
        showOperations: false,
        filtersUpdated:false,
        showLogScale:false,
        showSurvivalIcon:true
      }
    }, watch: {
      'filters': function(newVal, oldVal) {
        if(!this.filtersUpdated) {
          this.filtersUpdated = true;
          if (newVal.length == 0) {
            this.chartInst.filter(null);
            dc.redrawAll(this.groupid);
            this.$dispatch('update-filters');
          }
        } else{
          this.filtersUpdated = false;
        }
      }
    },events: {
      'closeChart':function(){
        this.$dispatch('close');
      },
      'changeLogScale':function(logScaleChecked){
        $('#'+this.chartId).find('svg').remove();
        dc.deregisterChart(this.chartInst, this.groupid);
        this.initChart(logScaleChecked);
      }
    },
    methods: {
      mouseEnter: function() {
        this.showOperations = true;
      }, mouseLeave: function() {
        this.showOperations = false;
      },initChart:function(logScaleChecked){
        this.chartInst =
          this.barChart.init(this.ndx, {
            group_type:this.attributes.group_type,
            attrId: this.attributes.attr_id,
            displayName: this.attributes.display_name,
            chartDivId: this.chartDivId,
            chartId: this.chartId,
            groupid: this.groupid,
            width: settings_.barChart.width,
            height: settings_.barChart.height,
            logScaleChecked: logScaleChecked
          });
        this.showLogScale =this.barChart.hasLogScale();
        var self_ = this;
        this.chartInst.on('filtered', function(_chartInst, _filter) {
          if(!self_.filtersUpdated) {
            self_.filtersUpdated = true;
            var tempFilters_ = $.extend(true, [], self_.filters);
            tempFilters_ = iViz.shared.updateFilters(_filter, tempFilters_,
              self_.attributes.view_type);
            if (typeof tempFilters_ !== 'undefined' && tempFilters_.length !== 0) {
              tempFilters_[0] = tempFilters_[0].toFixed(2);
              tempFilters_[1] = tempFilters_[1].toFixed(2);
            }
            self_.filters = tempFilters_;
            self_.$dispatch('update-filters');
          }else{
            self_.filtersUpdated = false;
          }
        });
      }
    },
    ready: function() {
      this.barChart = new iViz.view.component.BarChart();
      this.barChart.setDownloadDataTypes(['tsv', 'pdf', 'svg']);
      settings_.barChart.width = window.style.vars.barchartWidth || 150;
      settings_.barChart.height = window.style.vars.barchartHeight || 150;
      this.initChart();
      this.$dispatch('data-loaded', true);
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

/**
 * Created by Yichao Sun on 5/11/16.
 */

'use strict';
(function(iViz, _, d3, $) {
  iViz.view.component.ScatterPlot = function() {
    var content = this;
    var chartId_;
    var data_;
    var opts_;

    content.init = function(_data, opts) {
      opts_ = $.extend(true, {}, opts);
      chartId_ = opts_.chartId;
      data_ = _data;
      var _xArr = _.pluck(data_, 'cna_fraction'),
        _yArr = _.pluck(data_, 'mutation_count');
      var _qtips = [];
      _.each(data_, function(_dataObj) {
        _qtips.push("Cancer Study:" + _dataObj.study_id +  "<br>" + "Sample Id: " +  _dataObj.sample_id + "<br>" +"CNA fraction: " + _dataObj.cna_fraction + "<br>" + "Mutation count: " + _dataObj.mutation_count);
      });
      var trace = {
        x: _xArr,
        y: _yArr,
        text: _qtips,
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        study_id: _.pluck(data_, 'study_id'),
        sample_id: _.pluck(data_, 'sample_id'),
        marker: {
          size: 7,
          color: '#006bb3',
          line: {color: 'white'}
        }
      };
      var data = [trace];
      var _marginX = (d3.max(_xArr) - d3.min(_xArr)) * 0.05, 
          _marginY = (d3.max(_yArr) - d3.min(_yArr)) * 0.05;
      var layout = {
        xaxis: {
          title: 'Fraction of copy number altered genome',
          range: [ d3.min(_xArr) - _marginX, d3.max(_xArr) + _marginX ],
          fixedrange: true,
          zeroline: false,
          showline: true
        },
        yaxis: {
          title: '# of mutations',
          range: [ d3.min(_yArr) - _marginY, d3.max(_yArr) + _marginY ],
          zeroline: false,
          showline: true
        },
        hovermode: 'closest',
        showlegend: false,
        width: 370,
        height: 320,
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 50,
          pad: 0
        },
      };
      Plotly.plot(document.getElementById(chartId_), data, layout);

      //link to sample view
      var _plotsElem = document.getElementById(chartId_);
      _plotsElem.on('plotly_click', function(data){
        var _pts_study_id = data.points[0].data.study_id[data.points[0].pointNumber];
        var _pts_sample_id = data.points[0].data.sample_id[data.points[0].pointNumber];
        window.open(cbio.util.getLinkToSampleView(_pts_study_id, _pts_sample_id));
      });

      //link to sample view
      var _plotsElem = document.getElementById(chartId_);
      _plotsElem.on('plotly_click', function(data){
        var _pts_study_id = data.points[0].data.study_id[data.points[0].pointNumber];
        var _pts_sample_id = data.points[0].data.sample_id[data.points[0].pointNumber];
        window.open(cbio.util.getLinkToSampleView(_pts_study_id, _pts_sample_id));
      });
      
      initCanvasDownloadData();
    };

    content.update = function(_sampleIds) { // update selected samples (change color)
      
      var _selectedData = [], _unselectedData = [];

      var _tmpSelectedSampleIdMap = {};
      _.each(_sampleIds, function(_sampleId) {
        _tmpSelectedSampleIdMap[_sampleId] = '';
      });
      _.each(data_, function(_dataObj) {
        if (_tmpSelectedSampleIdMap.hasOwnProperty(_dataObj.sample_id)) {
          _selectedData.push(_dataObj);
        } else {
          _unselectedData.push(_dataObj);
        }
      });
      
      document.getElementById(chartId_).data = [];
      var _unselectedDataQtips = [], _selectedDataQtips = [];
      
      _.each(_unselectedData, function(_dataObj) {
        _unselectedDataQtips.push("Cancer Study:" + _dataObj.study_id + "<br>" + "Sample Id: " +  _dataObj.sample_id + "<br>" +"CNA fraction: " + _dataObj.cna_fraction + "<br>" + "Mutation count: " + _dataObj.mutation_count);
      });
      _.each(_selectedData, function(_dataObj) {
        _selectedDataQtips.push("Cancer Study:" + _dataObj.study_id + "<br>" + "Sample Id: " +  _dataObj.sample_id + "<br>" +"CNA fraction: " + _dataObj.cna_fraction + "<br>" + "Mutation count: " + _dataObj.mutation_count);
      });
      document.getElementById(chartId_).data[0] = {
        x: _.pluck(_unselectedData, 'cna_fraction'),
        y: _.pluck(_unselectedData, 'mutation_count'),
        text: _unselectedDataQtips,
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        study_id: _.pluck(data_, 'study_id'),
        sample_id: _.pluck(data_, 'sample_id'),
        marker: {
          size: 6,
          color: '#006bb3',
          line: {color: 'white'}
        }
      };
      document.getElementById(chartId_).data[1] = {
        x: _.pluck(_selectedData, 'cna_fraction'),
        y: _.pluck(_selectedData, 'mutation_count'),
        text: _selectedDataQtips,
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        study_id: _.pluck(data_, 'study_id'),
        sample_id: _.pluck(data_, 'sample_id'),
        marker: {
          size: 6, 
          color: 'red',
          line: {color: 'white'}
        }
      };
      Plotly.redraw(document.getElementById(chartId_));
    }

    content.updateDataForDownload = function(fileType) {
      if (['pdf', 'svg'].indexOf(fileType) !== -1) {
        initCanvasDownloadData();
      }
    }
    
    function initCanvasDownloadData() {
      content.setDownloadData('svg', {
        title: opts_.title,
        chartDivId: opts_.chartId,
        fileName: opts_.title
      });
      content.setDownloadData('pdf', {
        title: opts_.title,
        chartDivId: opts_.chartId,
        fileName: opts_.title
      });
    }

    // return content;
  };

  iViz.view.component.ScatterPlot.prototype = new iViz.view.component.GeneralChart('scatterPlot');
  iViz.view.component.ScatterPlot.constructor = iViz.view.component.ScatterPlot;
  iViz.util.scatterPlot = (function() {
  })();
})(window.iViz, window._, window.d3, window.jQuery || window.$);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * @author Yichao Sun on 5/11/16.
 */
'use strict';
(function(Vue, dc, iViz) {
  Vue.component('scatterPlot', {
    template: '<div id={{chartDivId}} class="grid-item grid-item-h-2 grid-item-w-2" @mouseenter="mouseEnter" @mouseleave="mouseLeave">' +
      '<chart-operations :show-operations="showOperations"' +
    ' :display-name="displayName" :has-chart-title="true" :groupid="groupid"' +
    ' :reset-btn-id="resetBtnId" :chart-ctrl="chartInst" :chart="chartInst" :chart-id="chartId"' +
    ' :attributes="attributes" :filters.sync="filters" :filters.sync="filters"></chart-operations>' +
    ' <div :class="{\'start-loading\': showLoad}" class="dc-chart dc-scatter-plot" align="center" style="float:none !important;" id={{chartId}} ></div>' +
    ' <div id="chart-loader"  :class="{\'show-loading\': showLoad}" class="chart-loader" style="top: 30%; left: 30%; display: none;">' +
    ' <img src="images/ajax-loader.gif" alt="loading"></div></div>',
    props: [
      'ndx', 'attributes', 'options', 'filters', 'groupid'
    ],
    data: function() {
      return {
        charDivId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-div',
        resetBtnId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-reset',
        chartId: 'chart-new-' + this.attributes.attr_id.replace(/\(|\)| /g, ""),
        displayName: this.attributes.display_name,
        showOperations: false,
        selectedSamples: [],
        chartInst: {},
        hasFilters:false,
        showLoad:true,
        invisibleDimension:{}
      };
    },
    watch: {
      'filters': function(newVal,oldVal) {
        if(newVal.length === 0 ){
          this.invisibleDimension.filterAll();
          dc.redrawAll(this.groupid);
        }
        this.updateFilters();
      }
    },
    events: {
      'show-loader':function(){
        this.showLoad = true;
      },
      'update-special-charts': function() {
        var attrId = this.attributes.group_type==='patient'?'patient_id':'sample_id';
        var _selectedCases = _.pluck(this.invisibleDimension.top(Infinity),attrId);
        var data = iViz.getAttrData(this.attributes.group_type);
        if (_selectedCases.length !== data.length) {
          this.selectedSamples=_selectedCases;
          this.chartInst.update(_selectedCases);
        } else {
          this.selectedSamples=_selectedCases;
          this.chartInst.update([]);
        }
        this.showLoad = false;
      },
      'closeChart':function(){
        if(this.filters.length>0){
          this.filters = [];
          this.updateFilters();
        }
        this.$dispatch('close');
      }
    },
    methods: {
      mouseEnter: function() {
        this.showOperations = true;
      }, mouseLeave: function() {
        this.showOperations = false;
      },
      updateFilters: function(){
        this.$dispatch('update-filters');
      }
    },
    ready: function() {
      
      var _self = this;
      _self.showLoad = true;
      var _opts = {
        chartId: this.chartId,
        chartDivId: this.charDivId,
        title: this.attributes.display_name
      };
      var attrId = this.attributes.group_type==='patient'?'patient_id':'sample_id';
      this.invisibleDimension  = this.ndx.dimension(function (d) { return d[attrId]; });
      
      var data = iViz.getAttrData(this.attributes.group_type);
      _self.chartInst = new iViz.view.component.ScatterPlot();
      _self.chartInst.init(data, _opts);
      _self.chartInst.setDownloadDataTypes(['pdf', 'svg']);
      /*var _selectedSamples = this.$parent.$parent.$parent.selectedsamples;
      if (_selectedSamples.length !== data.length) {
        this.selectedSamples=_selectedSamples;
        this.chartInst.update(_selectedSamples);
      }*/
      document.getElementById(this.chartId).on('plotly_selected', function(_eventData) {
        if (typeof _eventData !== 'undefined') {
          var _selectedData = [];
          // create hash map for (overall) data with cna_fraction + mutation count as key, dataObj as value (performance concern)
          var _CnaFracMutCntMap = {};
          _.each(data, function(_dataObj) {
            var _key = _dataObj['cna_fraction'] + "||" + _dataObj['mutation_count'];
            _CnaFracMutCntMap[_key] = _dataObj;
          });
          _.each(_eventData.points, function(_pointObj) {
            if (_pointObj.x) {
              _selectedData.push(_CnaFracMutCntMap[_pointObj.x + "||" + _pointObj.y]);
            }
          });
          var _selectedCases =  _.pluck(_selectedData, "sample_id").sort();
          _self.selectedSamples =_selectedCases;
          _self.filters =_selectedCases;
          //_self.$dispatch('update-samples', _self.selectedSamples);

          var self_ = this;
          var filtersMap = {};
          _.each(_selectedCases,function(filter){
            if(filtersMap[filter] === undefined){
              filtersMap[filter] = true;
            }
          });
          _self.invisibleDimension.filterFunction(function(d){
            return (filtersMap[d] !== undefined);
          });
          dc.redrawAll(_self.groupid);
        }
      });
      _self.showLoad = false;
      this.$dispatch('data-loaded', true);
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

/**
 * Created by Yichao Sun on 5/18/16.
 */

'use strict';
(function(iViz, _) {
  iViz.view.component.Survival = function() {
    var content_ = this;
    var data_ = {};
    var opts_ = {};

    content_.init = function(_data, _opts, _selectedPatientList) { //_attrId here indicates chart type (OS or DFS)
      opts_ = $.extend(true, {}, _opts);
      $('#' + opts_.chartId).empty();
      data_ = _data;
      var _dataProxy = new survivalChartProxy(_data, opts_.attrId);
      this.chartInst_ = new survivalCurve(opts_.chartId, _dataProxy.get(), opts_);
      this.update(_selectedPatientList, opts_.chartId, opts_.attrId);
    };

    content_.update = function(_selectedPatients, _chartId, _attrId) {

      // remove previous curves
      this.chartInst_.removeCurves();

      // separate selected and unselected data
      var _selectedData = [], _unselectedData = [];
      var _tmpSelectedPatientIdMap = {};
      _.each(_selectedPatients, function(_patientId) {
        _tmpSelectedPatientIdMap[_patientId] = '';
      });
      _.each(Object.keys(iViz.getCaseIndices(opts_.type)), function(_patientId) {
        var _index = iViz.getCaseIndices(opts_.type)[_patientId];
        if (_tmpSelectedPatientIdMap.hasOwnProperty(_patientId)) {
          _selectedData.push(data_[_index]);
        } else {
          _unselectedData.push(data_[_index]);
        }
      });
      
      // settings for different curves
      var _selectedDataProxy = new survivalChartProxy(_selectedData, _attrId);
      var _unselectedDataProxy = new survivalChartProxy(_unselectedData, _attrId);

      // add curves
      if (_unselectedDataProxy.get().length === 0) {
        this.chartInst_.addCurve(_selectedDataProxy.get(), 0, "#006bb3");
        this.chartInst_.removePval();
      } else {
        this.chartInst_.addCurve(_selectedDataProxy.get(), 0, "red");
        this.chartInst_.addCurve(_unselectedDataProxy.get(), 1, "#006bb3");
        this.chartInst_.addPval(_selectedDataProxy.get(), _unselectedDataProxy.get());
      }
    }

    content_.updateDataForDownload = function(fileType) {
      if (['pdf', 'svg'].indexOf(fileType) !== -1) {
        initCanvasDownloadData();
      }
    }
    
    function initCanvasDownloadData() {
      content_.setDownloadData('svg', {
        title: opts_.title,
        chartDivId: opts_.chartId,
        fileName: opts_.title
      });
      content_.setDownloadData('pdf', {
        title: opts_.title,
        chartDivId: opts_.chartId,
        fileName: opts_.title
      });
    }

    // return content_;
  };
  iViz.view.component.Survival.prototype = new iViz.view.component.GeneralChart('survivalPlot');
  iViz.view.component.Survival.constructor = iViz.view.component.Survival;
})(window.iViz, window._);

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * @author Yichao Sun on 5/18/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  Vue.component('survival', {
    template: '<div id={{chartDivId}} class="grid-item grid-item-h-2 grid-item-w-2" @mouseenter="mouseEnter" @mouseleave="mouseLeave">' +
              '<chart-operations :show-operations="showOperations" :has-chart-title="hasChartTitle" :display-name="displayName" :groupid="groupid" :reset-btn-id="resetBtnId" :chart-ctrl="chartInst" :chart="chartInst" :chart-id="chartId" :attributes="attributes"></chart-operations>' +
              '<div :class="{\'start-loading\': showLoad}" class="dc-chart dc-scatter-plot" align="center" style="float:none !important;" id={{chartId}} ></div>' +
              '<div id="chart-loader"  :class="{\'show-loading\': showLoad}" class="chart-loader" style="top: 30%; left: 30%; display: none;">' +
    '<img src="images/ajax-loader.gif" alt="loading"></div></div>',
    props: [
      'ndx', 'attributes', 'options', 'filters', 'groupid'
    ],
    created: function() {
    },
    data: function() {
      return {
        chartDivId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-div',
        resetBtnId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-reset',
        chartId: 'chart-new-' + this.attributes.attr_id.replace(/\(|\)| /g, ""),
        displayName: this.attributes.display_name,
        chartInst: '',
        showOperations: false,
        fromWatch: false,
        fromFilter: false,
        hasChartTitle:true,
        showLoad:true,
        invisibleDimension:{}
      };
    },
    events: {
      'show-loader':function(){
        this.showLoad = true;
      },
      'update-special-charts': function() {
        var attrId = this.attributes.group_type==='patient'?'patient_id':'sample_id';
        var _selectedCases = _.pluck(this.invisibleDimension.top(Infinity),attrId);
        this.chartInst.update(_selectedCases, this.chartId, this.attributes.attr_id);
        this.showLoad = false;
      },
      'closeChart':function(){
        this.$dispatch('close');
      }
    },
    methods: {
      mouseEnter: function() {
        this.showOperations = true;
      }, mouseLeave: function() {
        this.showOperations = false;
      }
    },
    ready: function() {
      var _self = this;
      _self.showLoad = true;
      var attrId = this.attributes.group_type==='patient'?'patient_id':'sample_id';
      this.invisibleDimension  = this.ndx.dimension(function (d) { return d[attrId]; });
      var _opts = {
        width: window.style.vars.survivalWidth,
        height: window.style.vars.survivalHeight,
        chartId: this.chartId,
        attrId: this.attributes.attr_id,
        title: this.attributes.display_name,
        type: this.attributes.group_type
      };
      var _selectedPatientList = this.$parent.$parent.$parent.selectedpatients;
      _self.chartInst = new iViz.view.component.Survival();
      _self.chartInst.setDownloadDataTypes(['pdf', 'svg']);

      var data = iViz.getAttrData(this.attributes.group_type);
      _self.chartInst.init(data, _opts, _selectedPatientList);
      _self.showLoad = false;
      this.$dispatch('data-loaded', true);
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);

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

var survivalChartProxy = function (_data, _attrId) { //_attrId here indicates chart type: DFS_SURVIVAL or OS_SURVIVAL

  var datum_ = {
      study_id: "",
      patient_id: "",
      time: "",    //num of months
      status: "", 
      num_at_risk: -1,
      survival_rate: 0
    },
    datumArr_ = [];

  // convert raw data
  var _totalNum = 0;
  _.each(_data, function (_dataObj) {
    var _status, _time;
    if (_attrId === 'DFS_SURVIVAL') {
      _time = _dataObj.DFS_MONTHS;
      _status = _dataObj.DFS_STATUS;
    } else if (_attrId === 'OS_SURVIVAL') {
      _time = _dataObj.OS_MONTHS;
      _status = _dataObj.OS_STATUS;
    }
    if (_time !== 'NaN' && _time !== 'NA' &&
    _status !== 'NaN' && _status !== 'NA' &&
    typeof _status !== 'undefined' && typeof _time !== 'undefined') {
      var _datum = jQuery.extend(true, {}, datum_);
      _datum.patient_id = _dataObj.patient_id;
      _datum.study_id = _dataObj.study_id;
      _datum.time = parseFloat(_time);
      _datum.status = _status;
      datumArr_.push(_datum);
      _totalNum += 1;
    }
  });
  
  // convert status from string to number
  // os: DECEASED-->1, LIVING-->0; dfs: Recurred/Progressed --> 1, Disease Free-->0
  _.each(datumArr_, function(_datumObj) {
    var _status = _datumObj.status.toString().toLowerCase();
    if (_status === 'deceased' || _status === 'recurred/progressed' || _status === 'recurred') {
      _datumObj.status = 1;
    } else if (_status === 'living' || _status === 'disease free' || _status === 'diseasefree') {
      _datumObj.status = 0;
    }
  });
  
  // calculate num at risk
  datumArr_ = _.sortBy(datumArr_, 'time');
  for (var i in datumArr_) {
    datumArr_[i].num_at_risk = _totalNum;
    _totalNum += -1;
  }
  
  // calculate survival rate
  kmEstimator.calc(datumArr_);

  return {
    get: function() {
      return datumArr_;
    }
  }
};
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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

'use strict'
var survivalCurve = function (_divId, _data, _opts) {

  var _self = this;

  _self.elem_ = '';
  _self.divId_ = _divId;
  _self.data_ = _data;
  _self.opts_ = _opts;
  var formatAsPercentage_ = d3.format('%');
  
  var leftMargin_ = 60, rightMargin_ = 10,
      topMargin_ = 15, bottomMargin_ = 60;

  _self.elem_ = d3.select('#' + _self.divId_);
  _self.elem_.svg = _self.elem_.append('svg')
    .attr('width', _opts.width)
    .attr('height', _opts.height);

  // init axis
  _self.elem_.xScale = d3.scale.linear()
    .domain([0, d3.max(_.pluck(_self.data_, 'time'))])
    .range([leftMargin_,  _opts.width - rightMargin_]);
  _self.elem_.yScale = d3.scale.linear()
    .domain([-0.03, 1.05]) //fixed to be 0-1
    .range([topMargin_ - bottomMargin_ + _opts.height, topMargin_]);
  _self.elem_.xAxis = d3.svg.axis()
    .scale(_self.elem_.xScale)
    .orient('bottom')
    .tickSize(6, 0, 0);
  _self.elem_.yAxis = d3.svg.axis()
    .scale(_self.elem_.yScale)
    .tickFormat(formatAsPercentage_)
    .orient('left')
    .tickSize(6, 0, 0);

  // draw axis
  _self.elem_.svg.append('g')
    .style('stroke-width', 1)
    .style('fill', 'none')
    .style('stroke', 'black')
    .attr('class', 'survival-curve-x-axis-class')
    .style('shape-rendering', 'crispEdges')
    .attr('transform', 'translate(0, ' + (topMargin_ - bottomMargin_ + _opts.height) + ')')
    .call(_self.elem_.xAxis);
  _self.elem_.svg.append('g')
    .style('stroke-width', 1)
    .style('fill', 'none')
    .style('stroke', 'black')
    .style('shape-rendering', 'crispEdges')
    .attr('transform', 'translate(0, ' + topMargin_ + ')')
    .call(_self.elem_.xAxis.orient('bottom').ticks(0));
  _self.elem_.svg.append('g')
    .style('stroke-width', 1)
    .style('fill', 'none')
    .style('stroke', 'black')
    .attr('class', 'survival-curve-y-axis-class')
    .style('shape-rendering', 'crispEdges')
    .attr('transform', 'translate(' + leftMargin_ + ', 0)')
    .call(_self.elem_.yAxis);
  _self.elem_.svg.append('g')
    .style('stroke-width', 1)
    .style('fill', 'none')
    .style('stroke', 'black')
    .style('shape-rendering', 'crispEdges')
    .attr('transform', 'translate(' + (_opts.width - rightMargin_) + ', 0)')
    .call(_self.elem_.yAxis.orient('left').ticks(0));
  _self.elem_.svg.selectAll('text')
    .style('font-family', 'sans-serif')
    .style('font-size', '11px')
    .style('stroke-width', 0.5)
    .style('stroke', 'black')
    .style('fill', 'black');

  // append axis title
  _self.elem_.svg.append('text')
    .attr('class', 'label')
    .attr('x', leftMargin_ + (_opts.width - leftMargin_) / 2)
    .attr('y', (topMargin_ + _opts.height - 25))
    .style('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight','bold')
    .text('Months Survival');
  _self.elem_.svg.append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('x', (topMargin_ - _opts.height) /2)
    .attr('y', leftMargin_ - 45 )
    .style('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight','bold')
    .text('Surviving');

  _self.elem_.dots = [];
  _self.elem_.line = [];

};

survivalCurve.prototype.addCurve = function(_data, _curveIndex, _lineColor) {
  
  var _self = this;
  
  // add an empty/zero point so the curve starts from zero time point
  if (_data !== null && _data.length !== 0) {
    if (_data[0].time !== 0) {
      _data.unshift({
        status: 0,
        survival_rate: 1,
        time: 0
      });
    }    
  }
  
  // init line elem
  _self.elem_.line[_curveIndex] = d3.svg.line()
    .interpolate('step-after')
    .x(function (d) {
      return _self.elem_.xScale(d.time);
    })
    .y(function (d) {
      return _self.elem_.yScale(d.survival_rate);
    });
  
  // draw line
  if (_data !== null && _data.length > 0) {
    _self.elem_.svg.append('path')
      .attr('id', _self.divId_ + '-line')
      .attr('d', _self.elem_.line[_curveIndex](_data))
      .attr('class', 'curve')
      .style('fill', 'none')
      .style('stroke', _lineColor);
  }

  // draw censored dots
  // crossDots specifically for the curve for easier deletion
  // changed two separate lines to a single cross symbol
  _self.elem_.svg.selectAll('path')
    .data(_data)
    .enter()
    .append('line')
    .filter(function (d) {
      return d.status === 0;
    })
    .attr('x1', function(d) { return _self.elem_.xScale(d.time); })
    .attr('y1', function(d) { return _self.elem_.yScale(d.survival_rate) - 5; })
    .attr('x2', function(d) { return _self.elem_.xScale(d.time); })
    .attr('y2', function(d) { return _self.elem_.yScale(d.survival_rate) + 5 ; })
    .attr('class', 'curve')
    .style('stroke-width', 1)
    .style('stroke', _lineColor);

  // draw invisible dots
  _self.elem_.dots[_curveIndex] = _self.elem_.svg.append("g");
  _self.elem_.dots[_curveIndex].selectAll('path')
    .data(_data)
    .enter()
    .append('svg:path')
    .on('mouseover', function(d) {
      var dot = d3.select(this);
      var _survivalRate = d3.select(this).attr('survival_rate');
      _survivalRate = parseFloat(_survivalRate).toFixed(2);
      var _time = d3.select(this).attr('time');
      _time = parseFloat(_time).toFixed(2);
      dot.transition()
        .duration(300)
        .style('opacity', .5);

        $(this).qtip(
          {
            content: {text: function() {
              var content =
                'Survival Rate: ' + '<strong>' + _survivalRate + '</strong>' + '<br>' +
                'Months: ' + '<strong>' + _time + '</strong>' + '<br>' +
                'Patient ID: ' + '<strong>' + d.patient_id + '</strong>' + '<br>' +
                'Study: ' + '<strong>' + d.study_id + '</strong>';
              return content;
            }},
            style: { classes: 'qtip-light qtip-rounded qtip-shadow qtip-lightyellow qtip-wide'},
            show: {
              event: 'mouseover',
              ready: true
            },
            hide: {fixed:true, delay: 100, event: 'mouseout'},
            position: {my:'left bottom',at:'top right'}
          }
        );
    })
    .on('mouseout', function(d) {
      var dot = d3.select(this);
      dot.transition()
        .duration(300)
        .style('opacity', 0);
    })
    .attr('time', function(d) { return d.time; })
    .attr('survival_rate', function(d) { return d.survival_rate; })
    .attr('d', d3.svg.symbol()
      .size(300)
      .type('circle'))
    .attr('transform', function(d){
      return 'translate(' + _self.elem_.xScale(d.time) + ', ' + _self.elem_.yScale(d.survival_rate) + ')';
    })
    .attr('fill', _lineColor)
    .style('opacity', 0)
    .attr('class', 'curve')
    .attr('class', 'invisible_dots');
  
};

survivalCurve.prototype.removeCurves = function() {
  var _self = this;
  _self.elem_.svg.selectAll(".curve").remove();
  _self.elem_.svg.selectAll(".invisible_dots").remove();
};

survivalCurve.prototype.addPval = function(_selectedData, _unselectedData) {
  var _self = this;
  _self.elem_.svg.selectAll(".pval").remove();
  _selectedData.splice(0, 1);
  _unselectedData.splice(0, 1);
  var _pVal = LogRankTest.calc(_selectedData, _unselectedData);
  _self.elem_.svg.append("text")
    .attr("class","pval")
    .attr("x", _self.opts_.width - 30)
    .attr("y", 30)
    .attr("font-size", 10)
    .style("text-anchor", "end")
    .text("p = " + _pVal.toPrecision(2));
}

survivalCurve.prototype.removePval = function() {
  var _self = this;
  _self.elem_.svg.selectAll(".pval").remove();
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


var kmEstimator = (function() {

  return {
    calc: function(_inputArr) { //calculate the survival rate for each time point
      //each item in the input already has fields: time, num at risk, event/status(0-->censored)
      var _prev_value = 1;  //cache for the previous value
      _.each(_inputArr, function(_inputObj) {
        if (_inputObj.status === 1) {
          _inputObj.survival_rate = _prev_value * ((_inputObj.num_at_risk - 1) / _inputObj.num_at_risk) ;
          _prev_value = _inputObj.survival_rate;
        } else if (_inputObj.status === 0) {
          _inputObj.survival_rate = _prev_value; //survival rate remain the same if the event is "censored"
        } else {
          //TODO: error handling
        }
      });
    }
  };

})(); //Close KmEstimator
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


var LogRankTest = (function() {

  var datum = {
      time: "",    //num of months
      num_of_failure_1: 0,
      num_of_failure_2: 0,
      num_at_risk_1: 0,
      num_at_risk_2: 0,
      expectation: 0, //(n1j / (n1j + n2j)) * (m1j + m2j)
      variance: 0
    },
    mergedArr = [];
  
  //os: DECEASED-->1, LIVING-->0; dfs: Recurred/Progressed --> 1, Disease Free-->0
  function mergeGrps(inputGrp1, inputGrp2) {
    var _ptr_1 = 0; //index indicator/pointer for group1
    var _ptr_2 = 0; //index indicator/pointer for group2

    while(_ptr_1 < inputGrp1.length && _ptr_2 < inputGrp2.length) { //Stop when either pointer reach the end of the array
      if (inputGrp1[_ptr_1].time < inputGrp2[_ptr_2].time) {
        var _datum = jQuery.extend(true, {}, datum);
        _datum.time = inputGrp1[_ptr_1].time;
        if (inputGrp1[_ptr_1].status === 1) {
          _datum.num_of_failure_1 = 1;
          _datum.num_at_risk_1 = inputGrp1[_ptr_1].num_at_risk;
          _datum.num_at_risk_2 = inputGrp2[_ptr_2].num_at_risk;
          _ptr_1 += 1;
        } else {
          _ptr_1 += 1;
          continue;
        }
      } else if (inputGrp1[_ptr_1].time > inputGrp2[_ptr_2].time) {
        var _datum = jQuery.extend(true, {}, datum);
        _datum.time = inputGrp2[_ptr_2].time;
        if (inputGrp2[_ptr_2].status === 1) {
          _datum.num_of_failure_2 = 1;
          _datum.num_at_risk_1 = inputGrp1[_ptr_1].num_at_risk;
          _datum.num_at_risk_2 = inputGrp2[_ptr_2].num_at_risk;
          _ptr_2 += 1;
        } else {
          _ptr_2 += 1;
          continue;
        }
      } else { //events occur at the same time point
        var _datum = jQuery.extend(true, {}, datum);
        _datum.time = inputGrp1[_ptr_1].time;
        if (inputGrp1[_ptr_1].status === 1 || inputGrp2[_ptr_2].status === 1) {
          if (inputGrp1[_ptr_1].status === 1) {
            _datum.num_of_failure_1 = 1;
          }
          if (inputGrp2[_ptr_2].status === 1) {
            _datum.num_of_failure_2 = 1;
          }
          _datum.num_at_risk_1 = inputGrp1[_ptr_1].num_at_risk;
          _datum.num_at_risk_2 = inputGrp2[_ptr_2].num_at_risk;
          _ptr_1 += 1;
          _ptr_2 += 1;
        } else {
          _ptr_1 += 1;
          _ptr_2 += 1;
          continue;
        }
      }
      mergedArr.push(_datum);
    }
  }

  function calcExpection() {
    $.each(mergedArr, function(index, _item) {
      _item.expectation = (_item.num_at_risk_1 / (_item.num_at_risk_1 + _item.num_at_risk_2)) * (_item.num_of_failure_1 + _item.num_of_failure_2);
    });
  }

  function calcVariance() {
    $.each(mergedArr, function(index, _item) {
      var _num_of_failures = _item.num_of_failure_1 + _item.num_of_failure_2;
      var _num_at_risk = _item.num_at_risk_1 + _item.num_at_risk_2;
      _item.variance = ( _num_of_failures * (_num_at_risk - _num_of_failures) * _item.num_at_risk_1 * _item.num_at_risk_2) / ((_num_at_risk * _num_at_risk) * (_num_at_risk - 1));
    });
  }

  function calcPval() {
    var O1 = 0, E1 = 0, V = 0;
    $.each(mergedArr, function(index, obj) {
      O1 += obj.num_of_failure_1;
      E1 += obj.expectation;
      V += obj.variance;
    });
    var chi_square_score = (O1 - E1) * (O1 - E1) / V;
    var _pVal = jStat.chisquare.cdf(chi_square_score, 1);
    return _pVal;
  }

  return {
    calc: function(inputGrp1, inputGrp2) {
      mergedArr.length = 0;
      mergeGrps(inputGrp1, inputGrp2);
      calcExpection();
      calcVariance();
      return calcPval();
    }
  };
}());
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 6/20/16.
 */
'use strict';
(function(iViz, dc, _, $) {
  // iViz pie chart component. It includes DC pie chart.
  iViz.view.component.TableView = function() {
    var content = this;
    var chartId_, data_;
    var type_ = '';
    var attr_ = [];
    var geneData_ = [];
    var selectedRows = [];
    var selectedGenes = [];
    var callbacks_ = {};
    var sequencedSampleIds = [];
    var selectedSamples = [];
    var allSamplesIds = [];
    var reactTableData = {};
    var initialized = false;
    var caseIndices = {};
    var selectedRowData = [];
    var selectedGeneData = [];
    var displayName = '';
    
    content.getCases = function() {
      return iViz.util.intersection(selectedSamples, sequencedSampleIds);
    };

    content.getSelectedRowData = function() {
      return selectedRowData;
    };
    content.clearSelectedRowData = function() {
      selectedRowData = [];
    };


    content.init =
      function(_attributes, _selectedSamples, _selectedGenes,
               _data, _chartId, _callbacks) {
        initialized = false;
        allSamplesIds = _selectedSamples;
        selectedSamples = _selectedSamples;
        selectedSamples.sort();
        sequencedSampleIds = _attributes.options.sequencedCases;
        sequencedSampleIds.sort();
        selectedGenes = _selectedGenes;
        chartId_ = _chartId;
        caseIndices = iViz.getCaseIndices(_attributes.group_type);
        data_ = _data;
        geneData_ = iViz.getTableData(_attributes.attr_id);
        type_ = _attributes.type;
        displayName = _attributes.attr_id || 'Table';
        callbacks_ = _callbacks;
        initReactTable(true);
      };

    content.update = function(_selectedSamples, _selectedRows) {
      var selectedGenesMap_ = [];
      var includeMutationCount = false;
      if (_selectedRows !== undefined)
        selectedRows = _selectedRows;
      _selectedSamples.sort();
      if ((!initialized) || (!iViz.util.compare(selectedSamples, _selectedSamples))) {
        initialized = true;
        selectedSamples = _selectedSamples;
        if (!iViz.util.compare(allSamplesIds, selectedSamples)) {
          _.each(_selectedSamples, function(caseId) {
            var caseIndex_ = caseIndices[caseId];
            var caseData_ = data_[caseIndex_];
            var tempData_ = '';
            switch (type_) {
              case 'mutatedGene':
                tempData_ = caseData_.mutated_genes;
                includeMutationCount = true;
                break;
              case 'cna':
                tempData_ = caseData_.cna_details;
                includeMutationCount = false;
                break;
            }
            _.each(tempData_, function(geneIndex) {
              if (selectedGenesMap_[geneIndex] === undefined) {
                selectedGenesMap_[geneIndex] = {};
                if (includeMutationCount) {
                  selectedGenesMap_[geneIndex].num_muts = 1;
                }
                selectedGenesMap_[geneIndex].caseIds = [caseId];
              } else {
                if (includeMutationCount) {
                  selectedGenesMap_[geneIndex].num_muts =
                    selectedGenesMap_[geneIndex].num_muts + 1;
                }
                selectedGenesMap_[geneIndex].caseIds.push(caseId);
              }
            });
          });
          initReactTable(true, selectedGenesMap_);
        } else {
          initReactTable(true);
        }
      } else {
        initReactTable(false);
      }
    };

    content.updateGenes = function(genes) {
      selectedGenes = genes;
      initReactTable(false);
    };

    content.updateDataForDownload = function(fileType) {
      if (fileType === 'tsv') {
        initTsvDownloadData();
      }
    }

    function initReactTable(_reloadData, _selectedGenesMap) {
      if (_reloadData)
        reactTableData = initReactData(_selectedGenesMap);
      var _opts = {
        input: reactTableData,
        filter: "ALL",
        download: "NONE",
        downloadFileName: "data.txt",
        showHide: false,
        hideFilter: true,
        scroller: true,
        resultInfo: false,
        groupHeader: false,
        fixedChoose: false,
        uniqueId: 'uniqueId',
        rowHeight: 25,
        tableWidth: 373,
        maxHeight: 290,
        headerHeight: 26,
        groupHeaderHeight: 40,
        autoColumnWidth: false,
        columnMaxWidth: 300,
        columnSorting: false,
        selectedRows: selectedRows,
        selectedGene: selectedGenes,
        rowClickFunc: reactRowClickCallback,
        geneClickFunc: reactGeneClickCallback,
        selectButtonClickCallback: reactSubmitClickCallback,
        // sortBy: "name",
        // sortDir: "DESC",
        tableType: type_
      };
      var testElement = React.createElement(EnhancedFixedDataTableSpecial,
        _opts);

      ReactDOM.render(testElement, document.getElementById(chartId_));
    }

    function mutatedGenesData(_selectedGenesMap) {
      var numOfCases_ = content.getCases().length;

      selectedGeneData.length = 0;

      if (geneData_) {
        _.each(geneData_, function(item) {
          var datum = {};
          datum.gene = item.gene;
          if (_selectedGenesMap !== undefined) {
            if (_selectedGenesMap[item.index] !== undefined) {
              datum.caseIds =iViz.util.unique(_selectedGenesMap[item.index].caseIds);
              datum.samples = datum.caseIds.length;
              switch (type_) {
                case 'mutatedGene':
                  datum.numOfMutations = _selectedGenesMap[item.index].num_muts;
                  datum.sampleRate = (numOfCases_ <= 0 ? 0 :
                      ((datum.samples / Number(numOfCases_) * 100).toFixed(
                        1))) + '%';
                  datum.uniqueId = datum.gene;
                  break;
                case 'cna':
                  datum.cytoband = item.cytoband;
                  datum.altType = item.cna;
                  datum.altrateInSample = ((numOfCases_ <= 0 ? 0 :
                      (datum.samples / numOfCases_ * 100).toFixed(1))) + '%';
                  datum.uniqueId = datum.gene + '-' + datum.altType;
                  break;
              }
            } else {
              return;
            }
          } else {
            datum.caseIds = iViz.util.unique(item.caseIds);
            datum.samples = datum.caseIds.length;
            switch (type_) {
              case 'mutatedGene':
                datum.numOfMutations = item.num_muts;
                datum.sampleRate = (numOfCases_ <= 0 ? 0 :
                    ((datum.samples / Number(numOfCases_) * 100).toFixed(1))) +
                  '%';
                datum.uniqueId = datum.gene;
                break;
              case 'cna':
                datum.cytoband = item.cytoband;
                datum.altType = item.cna;
                datum.altrateInSample = ((numOfCases_ <= 0 ? 0 :
                    (datum.samples / numOfCases_ * 100).toFixed(1))) + '%';
                datum.uniqueId = datum.gene + '-' + datum.altType;
                break;
            }
          }

          if (item.qval !== null) {
            var qval = Number(item.qval);
            if (qval === 0) {
              datum.qval = 0;
            } else {
              datum.qval = qval.toExponential(1);
            }
          } else {
            datum.qval = '';
          }
          selectedGeneData.push(datum);
        })
      }
      return selectedGeneData;
    }

    function initReactData(_selectedGenesMap) {
      attr_ = iViz.util.tableView.getAttributes(type_);
      var result = {
        data: [],
        attributes: attr_
      };
      var _mutationData = mutatedGenesData(_selectedGenesMap);
      _.each(_mutationData, function(item) {
        for (var key in item) {
          var datum = {
            attr_id: key,
            uniqueId: item.uniqueId,
            attr_val: key === 'caseIds' ? item.caseIds.join(',') : item[key]
          };
          result.data.push(datum);
        }
      });
      return result;

    }

    function reactSubmitClickCallback() {
      callbacks_.submitClick(selectedRowData);
    }

    function reactRowClickCallback(data, selected, _selectedRows) {
      if (selected) {
        selectedRowData.push(data);
      }
      else {
        selectedRowData = _.filter(selectedRowData, function(index, item) {
          return (item.uniqueId === selected.uniqueId);
        });
      }
    }

    function reactGeneClickCallback(selectedRow, selected) {
      callbacks_.addGeneClick(selectedRow);
    }

    function initTsvDownloadData() {
      var attrs = iViz.util.tableView.getAttributes(type_).filter(function(attr) {
        return attr.attr_id !== 'uniqueId';
      });
      var downloadOpts = {
        fileName: displayName,
        data: ''
      };

      if (_.isArray(attrs) && attrs.length > 0) {
        var data = attrs.map(function(attr) {
            return attr.display_name;
          }).join('\t') + '\n';

        _.each(selectedGeneData, function(row) {
          var _tmp = [];
          _.each(attrs, function(attr) {
            _tmp.push(row[attr.attr_id] || '');
          })
          data += _tmp.join('\t') + '\n';
        });

        downloadOpts.data = data;
      }
      content.setDownloadData('tsv', downloadOpts);
    }
  }
  iViz.view.component.TableView.prototype = new iViz.view.component.GeneralChart('table');


  iViz.util.tableView = (function() {
    var content = {};
    content.compare = function(arr1, arr2) {
      if (arr1.length != arr2.length) return false;
      for (var i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) == -1)
          return false;
      }
      return true;
    };
    
    content.getAttributes = function(type) {
      var _attr = [];
      switch (type) {
        case 'mutatedGene':
          _attr = [
            {
              "attr_id": "gene",
              "display_name": "Gene",
              "datatype": "STRING",
              "column_width": 100
            }, {
              "attr_id": "numOfMutations",
              "display_name": "# Mut",
              "datatype": "NUMBER",
              "column_width": 90
            },
            {
              "attr_id": "samples",
              "display_name": "#",
              "datatype": "NUMBER",
              "column_width": 90
            },
            {
              "attr_id": "sampleRate",
              "display_name": "Freq",
              "datatype": "PERCENTAGE",
              "column_width": 93
            },
            {
              "attr_id": "caseIds",
              "display_name": "Cases",
              "datatype": "STRING",
              "show": false
            },
            {
              "attr_id": "uniqueId",
              "display_name": "uniqueId",
              "datatype": "STRING",
              "show": false
            },
            {
              "attr_id": "qval",
              "datatype": "NUMBER",
              "display_name": "MutSig",
              "show": false
            }
          ];
          break;
        case 'cna':
          _attr = [
            {
              "attr_id": "gene",
              "display_name": "Gene",
              "datatype": "STRING",
              "column_width": 80
            },
            {
              "attr_id": "cytoband",
              "display_name": "Cytoband",
              "datatype": "STRING",
              "column_width": 90
            },
            {
              "attr_id": "altType",
              "display_name": "CNA",
              "datatype": "STRING",
              "column_width": 55
            },
            {
              "attr_id": "samples",
              "display_name": "#",
              "datatype": "NUMBER",
              "column_width": 70
            },
            {
              "attr_id": "altrateInSample",
              "display_name": "Freq",
              "datatype": "PERCENTAGE",
              "column_width": 78
            },
            {
              "attr_id": "caseIds",
              "display_name": "Cases",
              "datatype": "STRING",
              "show": false
            },
            {
              "attr_id": "uniqueId",
              "display_name": "uniqueId",
              "datatype": "STRING",
              "show": false
            },
            {
              "attr_id": "qval",
              "datatype": "NUMBER",
              "display_name": "Gistic",
              "show": false
            }
          ];
          break;
      }
      return _attr;
    };
    return content;
  })();
})(window.iViz,
  window.dc,
  window._,
  window.$ || window.jQuery);
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an 'as is' basis, and Memorial Sloan-Kettering Cancer Center has no
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
/**
 * Created by Karthik Kalletla on 6/20/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  Vue.component('tableView', {
    template: '<div id={{chartDivId}} class="grid-item grid-item-h-2 grid-item-w-2" @mouseenter="mouseEnter" @mouseleave="mouseLeave">' +
    '<chart-operations :show-operations="showOperations" :display-name="displayName" :chart-ctrl="chartInst"' +
    ':has-chart-title="true" :groupid="groupid" :reset-btn-id="resetBtnId" :chart="chartInst" ' +
    ':chart-id="chartId" :attributes="attributes" :filters.sync="filters" :filters.sync="filters"></chart-operations>' +
    '<div class="dc-chart dc-table-plot" :class="{\'start-loading\': showLoad}" align="center" style="float:none !important;" id={{chartId}} ></div>' +
    '<div id="chart-loader"  :class="{\'show-loading\': showLoad}" class="chart-loader" style="top: 30%; left: 30%; display: none;">' +
    '<img src="images/ajax-loader.gif" alt="loading"></div></div>',
    props: [
      'ndx', 'attributes', 'options', 'filters', 'groupid'
    ],
    data: function() {
      return {
        charDivId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-div',
        resetBtnId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, "") + '-reset',
        chartId: 'chart-new-' + this.attributes.attr_id.replace(/\(|\)| /g, ""),
        displayName: this.attributes.display_name,
        showOperations: false,
        chartInst: {},
        showLoad:true,
        selectedRows:[],
        invisibleDimension:{}
      };
    },
    watch: {
      'filters': function(newVal) {
        if(newVal.length === 0 ){
          this.invisibleDimension.filterAll();
          dc.redrawAll(this.groupid);
          this.selectedRows=[];
        }
        this.updateFilters();
      }
    },
    events: {
      'show-loader':function(){
        this.showLoad = true;
      },
      'gene-list-updated':function(genes){
        genes = $.extend(true,[],genes);
        this.chartInst.updateGenes(genes);
      },
      'update-special-charts': function() {
        var attrId = this.attributes.group_type==='patient'?'patient_id':'sample_id';
        var _selectedCases = _.pluck(this.invisibleDimension.top(Infinity),attrId);
        this.chartInst.update(_selectedCases, this.selectedRows);
        this.setDisplayTitle(this.chartInst.getCases().length);
        this.showLoad = false;
      },
      'closeChart':function(){
        if(this.filters.length>0){
          this.filters = [];
          this.updateFilters();
        }
        this.$dispatch('close',true);
      }
    },
    methods: {
      mouseEnter: function() {
        this.showOperations = true;
      },
      mouseLeave: function() {
        this.showOperations = false;
      },
      submitClick:function(_selectedRowData){
        var selectedSamplesUnion = [];
        var selectedRowsUids = _.pluck(_selectedRowData,'uniqueId');
        this.selectedRows = _.union(this.selectedRows,selectedRowsUids);
        _.each(_selectedRowData, function(item){
          var casesIds = item.caseIds.split(',');
          selectedSamplesUnion = selectedSamplesUnion.concat(casesIds);
        });
        if(this.filters.length === 0 ){
          this.filters = selectedSamplesUnion.sort();
        }else{
          this.filters = iViz.util.intersection(this.filters,selectedSamplesUnion.sort());
        }
        var self_ = this;
        var filtersMap = {};
        _.each(this.filters,function(filter){
          if(filtersMap[filter] === undefined){
            filtersMap[filter] = true;
          }
        });
        this.invisibleDimension.filterFunction(function(d){
          return (filtersMap[d] !== undefined);
        });
        dc.redrawAll(this.groupid);
        this.chartInst.clearSelectedRowData();
      },
      addGeneClick: function(clickedRowData) {
        this.$dispatch('manage-gene',clickedRowData.gene);
        QueryByGeneTextArea.addRemoveGene(clickedRowData.gene);
      },
      setDisplayTitle: function(numOfCases) {
        this.displayName = this.attributes.display_name+'('+numOfCases+' profiled samples)';
      },
      updateFilters: function(){
        this.$dispatch('update-filters');
      }

    },
    ready: function() {
      var _self = this;
      _self.showLoad = true;
      var callbacks = {};
      var attrId = this.attributes.group_type==='patient'?'patient_id':'sample_id';
      this.invisibleDimension  = this.ndx.dimension(function (d) { return d[attrId]; });
      
      callbacks.addGeneClick = this.addGeneClick;
      callbacks.submitClick = this.submitClick;
      _self.chartInst = new iViz.view.component.TableView();
      _self.chartInst.setDownloadDataTypes(['tsv']);

      var data = iViz.getAttrData(this.attributes.group_type);
      _self.chartInst.init(this.attributes, this.$root.selectedsamples, this.$root.selectedgenes, data, this.chartId, callbacks);
      this.setDisplayTitle(this.chartInst.getCases().length);
      _self.showLoad = false;
      this.$dispatch('data-loaded', true);
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);
'use strict';

var EnhancedFixedDataTableSpecial = (function() {
// Data button component
  var FileGrabber = React.createClass({displayName: "FileGrabber",
    // Saves table content to a text file
    saveFile: function() {
      var formatData = this.state.formatData || this.props.content();
      this.state.formatData = formatData;

      var blob = new Blob([formatData], {type: 'text/plain'});
      var fileName = this.props.downloadFileName ? this.props.downloadFileName : "data.txt";

      var downloadLink = document.createElement("a");
      downloadLink.download = fileName;
      downloadLink.innerHTML = "Download File";
      if (window.webkitURL) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(blob);
      }
      else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.onclick = function(event) {
          document.body.removeChild(event.target);
        };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
      }

      downloadLink.click();
    },

    getInitialState: function() {
      return {
        formatData: ''
      };
    },

    render: function() {
      return (
        React.createElement("button", {className: "btn btn-default", onClick: this.saveFile},
          "DATA")
      );
    }
  });

// Copy button component
  var ClipboardGrabber = React.createClass({displayName: "ClipboardGrabber",
    click: function() {
      if (!this.state.formatData) {
        var client = new ZeroClipboard($("#copy-button")), content = this.props.content();
        this.state.formatData = content;
        client.on("ready", function(readyEvent) {
          client.on("copy", function(event) {
            event.clipboardData.setData('text/plain', content);
          });
        });
      }
      this.notify();
    },

    notify: function() {
      $.notify({
        message: 'Copied.'
      }, {
        type: 'success',
        animate: {
          enter: 'animated fadeInDown',
          exit: 'animated fadeOutUp'
        },
        delay: 1000
      });
    },

    getInitialState: function() {
      return {
        formatData: ''
      };
    },

    render: function() {
      return (
        React.createElement("button", {className: "btn btn-default", id: "copy-button",
            onClick: this.click},
          "COPY")
      );
    }
  });

// Container of FileGrabber and ClipboardGrabber
  var DataGrabber = React.createClass({displayName: "DataGrabber",
    // Prepares table content data for download or copy button
    prepareContent: function() {
      var content = [], cols = this.props.cols, rows = this.props.rows;

      _.each(cols, function(e) {
        content.push((e.displayName || 'Unknown'), '\t');
      });
      content.pop();

      _.each(rows, function(row) {
        content.push('\r\n');
        _.each(cols, function(col) {
          content.push(row[col.name], '\t');
        });
        content.pop();
      });
      return content.join('');
    },

    render: function() {
      var getData = this.props.getData;
      if (getData === "NONE") {
        return React.createElement("div", null);
      }

      var content = this.prepareContent;

      return (
        React.createElement("div", null,
          React.createElement("div", {className: "EFDT-download-btn EFDT-top-btn"},

            getData != "COPY" ? React.createElement(FileGrabber, {content: content,
              downloadFileName: this.props.downloadFileName}) :
              React.createElement("div", null)

          ),
          React.createElement("div", {className: "EFDT-download-btn EFDT-top-btn"},

            getData != "DOWNLOAD" ? React.createElement(ClipboardGrabber, {content: content}) :
              React.createElement("div", null)

          )
        )
      );
    }
  });

// Wrapper of qTip for string
// Generates qTip when string length is larger than 20
  var QtipWrapper = React.createClass({displayName: "QtipWrapper",
    render: function() {
      var label = this.props.label, qtipFlag = false;
      var shortLabel = this.props.shortLabel;
      var className = this.props.className || '';
      var field = this.props.field;
      var color = this.props.color || '';
      var tableType = this.props.tableType || '';

      if (label && shortLabel && label.toString().length > shortLabel.toString().length) {
        qtipFlag = true;
      }
      return (
        React.createElement("span", {className: className + (qtipFlag?" hasQtip " : '') +
          ((field === 'altType' && ['mutatedGene', 'cna'].indexOf(tableType) !== -1) ? (label === 'AMP' ? ' alt-type-red' : ' alt-type-blue') : ''),
            "data-qtip": label},

          (field === 'name' && tableType === 'pieLabel') ? (
            React.createElement("svg", {width: "15", height: "10"},
              React.createElement("g", null,
                React.createElement("rect", {height: "10", width: "10", fill: color})
              )
            )
          ) : '',

          shortLabel
        )
      );
    }
  });

// Column show/hide component
  var ColumnHider = React.createClass({displayName: "ColumnHider",
    tableCols: [],// For the checklist

    // Updates column show/hide settings
    hideColumns: function(list) {
      var cols = this.props.cols, filters = this.props.filters;
      for (var i = 0; i < list.length; i++) {
        cols[i].show = list[i].isChecked;
        if (this.props.hideFilter) {
          filters[cols[i].name].hide = !cols[i].show;
        }
      }
      this.props.updateCols(cols, filters);
    },

    // Prepares tableCols
    componentWillMount: function() {
      var cols = this.props.cols;
      var colsL = cols.length;
      for (var i = 0; i < colsL; i++) {
        this.tableCols.push({
          id: cols[i].name,
          label: cols[i].displayName,
          isChecked: cols[i].show
        });
      }
    },

    componentDidMount: function() {
      var hideColumns = this.hideColumns;

      // Dropdown checklist
      $('#hide_column_checklist')
        .dropdownCheckbox({
          data: this.tableCols,
          autosearch: true,
          title: "Show / Hide Columns",
          hideHeader: false,
          showNbSelected: true
        })
        // Handles dropdown checklist event
        .on("change", function() {
          var list = ($("#hide_column_checklist").dropdownCheckbox("items"));
          hideColumns(list);
        });
    },

    render: function() {
      return (
        React.createElement("div", {id: "hide_column_checklist", className: "EFDT-top-btn"})
      );
    }
  });

// Choose fixed columns component
  var PinColumns = React.createClass({displayName: "PinColumns",
    tableCols: [],// For the checklist

    // Updates fixed column settings
    pinColumns: function(list) {
      var cols = this.props.cols;
      for (var i = 0; i < list.length; i++) {
        cols[i].fixed = list[i].isChecked;
      }
      this.props.updateCols(cols, this.props.filters);
    },

    // Prepares tableCols
    componentWillMount: function() {
      var cols = this.props.cols;
      var colsL = cols.length;
      for (var i = 0; i < colsL; i++) {
        this.tableCols.push({
          id: cols[i].name,
          label: cols[i].displayName,
          isChecked: cols[i].fixed
        });
      }
    },

    componentDidMount: function() {
      var pinColumns = this.pinColumns;

      // Dropdown checklist
      $("#pin_column_checklist")
        .dropdownCheckbox({
          data: this.tableCols,
          autosearch: true,
          title: "Choose Fixed Columns",
          hideHeader: false,
          showNbSelected: true
        })
        // Handles dropdown checklist event
        .on("change", function() {
          var list = ($("#pin_column_checklist").dropdownCheckbox("items"));
          pinColumns(list);
        });
    },

    render: function() {
      return (
        React.createElement("div", {id: "pin_column_checklist", className: "EFDT-top-btn"})
      );
    }
  });

// Column scroller component
  var ColumnScroller = React.createClass({displayName: "ColumnScroller",
    // Scrolls to user selected column
    scrollToColumn: function(e) {
      var name = e.target.value, cols = this.props.cols, index, colsL = cols.length;
      for (var i = 0; i < colsL; i++) {
        if (name === cols[i].name) {
          index = i;
          break;
        }
      }
      this.props.updateGoToColumn(index);
    },

    render: function() {
      return (
        React.createElement(Chosen, {"data-placeholder": "Column Scroller",
            onChange: this.scrollToColumn},

          this.props.cols.map(function(col) {
            return (
              React.createElement("option", {title: col.displayName, value: col.name},
                React.createElement(QtipWrapper, {label: col.displayName})
              )
            );
          })

        )
      );
    }
  });

// Filter component
  var Filter = React.createClass({displayName: "Filter",
    getInitialState: function() {
      return {key: ''};
    },
    handleChange: function(event) {
      this.setState({key: event.target.value});
      this.props.onFilterKeywordChange(event);
    },
    componentWillUpdate: function() {
      if (this.props.type === 'STRING') {
        if (!_.isUndefined(this.props.filter) && this.props.filter.key !== this.state.key && this.props.filter.key === '' && this.props.filter.reset) {
          this.state.key = '';
          this.props.filter.reset = false;
        }
      }
    },
    render: function() {
      if (this.props.type === "NUMBER" || this.props.type === "PERCENTAGE") {
        return (
          React.createElement("div", {className: "EFDT-header-filters"},
            React.createElement("span", {id: "range-"+this.props.name}),

            React.createElement("div", {className: "rangeSlider", "data-max": this.props.max,
              "data-min": this.props.min, "data-column": this.props.name,
              "data-type": this.props.type})
          )
        );
      } else {
        return (
          React.createElement("div", {className: "EFDT-header-filters"},
            React.createElement("input", {className: "form-control",
              placeholder: this.props.hasOwnProperty('placeholder')?this.props.placeholder:"Search...",
              "data-column": this.props.name,
              value: this.state.key,
              onChange: this.handleChange})
          )
        );
      }
    }
  });

// Table prefix component
// Contains components above the main part of table
  var TablePrefix = React.createClass({displayName: "TablePrefix",
    render: function() {
      return (
        React.createElement("div", null,
          React.createElement("div", null,

            this.props.hider ?
              React.createElement("div", {className: "EFDT-show-hide"},
                React.createElement(ColumnHider, {cols: this.props.cols,
                  filters: this.props.filters,
                  hideFilter: this.props.hideFilter,
                  updateCols: this.props.updateCols})
              ) :
              "",


            this.props.fixedChoose ?
              React.createElement("div", {className: "EFDT-fixed-choose"},
                React.createElement(PinColumns, {cols: this.props.cols,
                  filters: this.props.filters,
                  updateCols: this.props.updateCols})
              ) :
              "",

            React.createElement("div", {className: "EFDT-download"},
              React.createElement(DataGrabber, {cols: this.props.cols, rows: this.props.rows,
                downloadFileName: this.props.downloadFileName,
                getData: this.props.getData})
            ),

            this.props.resultInfo ?
              React.createElement("div", {className: "EFDT-result-info"},
                React.createElement("span", {className: "EFDT-result-info-content"},
                  "Showing ", this.props.filteredRowsSize, " samples",

                  this.props.filteredRowsSize !== this.props.rowsSize ?
                    React.createElement("span", null, ' (filtered from ' + this.props.rowsSize + ') ',
                      React.createElement("span", {className: "EFDT-header-filters-reset",
                        onClick: this.props.onResetFilters}, "Reset")
                    )
                    : ''

                )
              ) :
              ""

          ),
          React.createElement("div", null
          )
        )
      );
    }
  });

// Wrapper for the header rendering
  var HeaderWrapper = React.createClass({displayName: "HeaderWrapper",
    render: function() {
      var columnData = this.props.columnData;
      var shortLabel = this.props.shortLabel;
      return (
        React.createElement("div", {className: "EFDT-header"},
          React.createElement("span", {className: "EFDT-header-sort", href: "#",
              onClick: this.props.sortNSet.bind(null, this.props.cellDataKey)},
            React.createElement(QtipWrapper, {label: columnData.displayName,
              shortLabel: shortLabel,
              className: 'EFDT-header-sort-content'}),
            columnData.sortFlag ?
              React.createElement("div", {
                className: columnData.sortDirArrow + ' EFDT-header-sort-icon'})
              : ""
          )
        )
      );
    }
  });

  var CustomizeCell = React.createClass({displayName: "CustomizeCell",
    selectRow: function(rowIndex) {
      this.props.selectRow(rowIndex);
    },
    selectGene: function(rowIndex) {
      this.props.selectGene(rowIndex);
    },
    enterPieLabel: function(data) {
      this.props.pieLabelMouseEnterFunc(data);
    },
    leavePieLabel: function(data) {
      this.props.pieLabelMouseLeaveFunc(data);
    },
    render: function() {
      var Cell = FixedDataTable.Cell;
      var rowIndex = this.props.rowIndex, data = this.props.data, field = this.props.field, filterAll = this.props.filterAll;
      var flag = (data[rowIndex][field] && filterAll.length > 0) ?
        (data[rowIndex][field].toLowerCase().indexOf(filterAll.toLowerCase()) >= 0) : false;
      var shortLabels = this.props.shortLabels;
      var tableType = this.props.tableType;
      var confirmedRowsIndex = this.props.confirmedRowsIndex;
      return (
        React.createElement(Cell, {onFocus: this.onFocus, className: 'EFDT-cell EFDT-cell-full' +
          (this.props.selectedRowIndex.indexOf(data[rowIndex].index) != -1 ? ' row-selected' : ''),
            },
          React.createElement("span", {style: flag ? {backgroundColor:'yellow'} : {},
              onClick: field === 'gene' ? this.selectGene.bind(this, data[rowIndex].index) : '',
              onMouseEnter: (tableType === 'pieLabel' && _.isFunction(this.props.pieLabelMouseEnterFunc) && field === 'name') ? this.enterPieLabel.bind(this, data[rowIndex].row) : '',
              onMouseLeave: (tableType === 'pieLabel' && _.isFunction(this.props.pieLabelMouseLeaveFunc) && field === 'name') ? this.leavePieLabel.bind(this, data[rowIndex].row) : '',
              "data-qtip": field === 'gene' ? ('Click ' + data[rowIndex].row[field] + ' to ' + ( this.props.selectedGeneRowIndex.indexOf(data[rowIndex].index) === -1 ? 'add to ' : ' remove from ' ) + 'your query') : '',
              className: (field === 'gene' ? 'gene hasQtip' : '') +
              ((field === 'gene' && this.props.selectedGeneRowIndex.indexOf(data[rowIndex].index) != -1) ? ' gene-selected' : '')},
            React.createElement(QtipWrapper, {label: data[rowIndex].row[field],
              shortLabel: shortLabels[data[rowIndex].index][field],
              field: field,
              tableType: tableType,
              color: data[rowIndex].row.color})
          ),

          field === 'gene' && data[rowIndex].row.qval ?
            (tableType === 'mutatedGene' ?
              React.createElement("img", {src: "images/mutsig.png", className: "hasQtip qval-icon",
                "data-qtip": '<b>MutSig</b><br/><i>Q-value</i>: ' + data[rowIndex].row.qval}) :
              React.createElement("img", {src: "images/gistic.png", className: "hasQtip qval-icon",
                "data-qtip": '<b>Gistic</b><br/><i>Q-value</i>: ' + data[rowIndex].row.qval})) : '',


          field === 'samples' ?
            React.createElement("input", {type: "checkbox", style: {float: 'right'},
              title: 'Select ' + data[rowIndex].row[field]
              + ' sample' + (Number(data[rowIndex].row[field]) > 1 ? 's':'')
              + (tableType === 'mutatedGene' ? (' with ' + data[rowIndex].row.gene + ' mutation') :
                (tableType === 'cna' ? (' with ' + data[rowIndex].row.gene + ' ' + data[rowIndex].row.altType) :
                  (tableType === 'pieLabel' ? (' in ' + data[rowIndex].row.name)  : ''))),
              checked: this.props.selectedRowIndex.indexOf(data[rowIndex].index) != -1,
              disabled: this.props.confirmedRowsIndex.indexOf(data[rowIndex].index) !== -1,
              onChange: this.selectRow.bind(this, data[rowIndex].index)}) : ''

        )
      );
    }
  });

// Main part table component
// Uses FixedDataTable library
  var TableMainPart = React.createClass({displayName: "TableMainPart",
    // Creates Qtip
    createQtip: function() {
      $('.EFDT-table .hasQtip').one('mouseenter', function() {
        $(this).qtip({
          content: {text: $(this).attr('data-qtip')},
          hide: {fixed: true, delay: 100},
          show: {ready: true},
          style: {classes: 'qtip-light qtip-rounded qtip-shadow', tip: true},
          position: {my: 'center left', at: 'center right', viewport: $(window)}
        });
      });
    },

    // Creates Qtip after first rendering
    componentDidMount: function() {
      this.createQtip();
    },

    // Creates Qtip after update rendering
    componentDidUpdate: function() {
      this.createQtip();
    },

    // Creates Qtip after page scrolling
    onScrollEnd: function() {
      $(".qtip").remove();
      this.createQtip();
    },

    // Destroys Qtip before update rendering
    componentWillUpdate: function() {
      //console.log('number of elments which has "hasQtip" as class name: ', $('.hasQtip').size());
      //console.log('number of elments which has "hasQtip" as class name under class EFDT: ', $('.EFDT-table .hasQtip').size());

      $('.EFDT-table .hasQtip')
        .each(function() {
          $(this).qtip('destroy', true);
        });
    },

    getDefaultProps: function() {
      return {
        selectedRowIndex: []
      };
    },

    getInitialState: function() {
      return {
        selectedRowIndex: this.props.selectedRowIndex,
        selectedGeneRowIndex: this.props.selectedGeneRowIndex
      }
    },

    selectRow: function(rowIndex) {
      var selectedRowIndex = this.state.selectedRowIndex;
      var selected = false;
      var rows = this.props.rows;
      if ((_.intersection(selectedRowIndex, [rowIndex])).length > 0) {
        selectedRowIndex = _.without(selectedRowIndex, rowIndex);
      } else {
        selectedRowIndex.push(rowIndex);
        selected = true;
      }

      if (_.isFunction(this.props.rowClickFunc)) {
        var selectedData = selectedRowIndex.map(function(item) {
          return rows[item];
        });
        this.props.rowClickFunc(rows[rowIndex], selected, selectedData);
      }

      this.setState({
        selectedRowIndex: selectedRowIndex
      });
    },

    selectGene: function(rowIndex) {
      var selectedGeneRowIndex = this.state.selectedGeneRowIndex;
      var selected = false;
      var rows = this.props.rows;
      if ((_.intersection(selectedGeneRowIndex, [rowIndex])).length > 0) {
        selectedGeneRowIndex = _.without(selectedGeneRowIndex, rowIndex);
      } else {
        selectedGeneRowIndex.push(rowIndex);
        selected = true;
      }

      if (_.isFunction(this.props.geneClickFunc)) {
        this.props.geneClickFunc(rows[rowIndex], selected);
      }

      this.setState({
        selectedGeneRowIndex: selectedGeneRowIndex
      });
    },

    // If properties changed
    componentWillReceiveProps: function(newProps) {
      if (newProps.selectedRowIndex !== this.state.selectedRowIndex) {
        this.setState({
          selectedRowIndex: newProps.selectedRowIndex
        });
      }
      if (newProps.selectedGeneRowIndex !== this.state.selectedGeneRowIndex) {
        this.setState({
          selectedGeneRowIndex: newProps.selectedGeneRowIndex
        });
      }
    },

    // FixedDataTable render function
    render: function() {
      var Table = FixedDataTable.Table, Column = FixedDataTable.Column,
        ColumnGroup = FixedDataTable.ColumnGroup, props = this.props,
        rows = this.props.filteredRows, columnWidths = this.props.columnWidths,
        cellShortLabels = this.props.shortLabels.cell,
        headerShortLabels = this.props.shortLabels.header,
        confirmedRowsIndex=this.props.confirmedRowsIndex,
        selectedRowIndex = this.state.selectedRowIndex,
        selectedGeneRowIndex = this.state.selectedGeneRowIndex,
        self = this;

      return (
        React.createElement("div", null,
          React.createElement(Table, {
              rowHeight: props.rowHeight?props.rowHeight:30,
              rowGetter: this.rowGetter,
              onScrollEnd: this.onScrollEnd,
              rowsCount: props.filteredRows.length,
              width: props.tableWidth?props.tableWidth:1230,
              maxHeight: props.maxHeight?props.maxHeight:500,
              headerHeight: props.headerHeight?props.headerHeight:30,
              groupHeaderHeight: props.groupHeaderHeight?props.groupHeaderHeight:50,
              scrollToColumn: props.goToColumn,
              isColumnResizing: false,
              onColumnResizeEndCallback: props.onColumnResizeEndCallback
            },

            props.cols.map(function(col, index) {
              var column;
              var width = col.show ? (col.width ? col.width :
                (columnWidths[col.name] ? columnWidths[col.name] : 200)) : 0;

              if (props.groupHeader) {
                column = React.createElement(ColumnGroup, {
                    header:
                      React.createElement(Filter, {type: props.filters[col.name].type, name: col.name,
                        max: col.max, min: col.min, filter: props.filters[col.name],
                        placeholder: "Filter column",
                        onFilterKeywordChange: props.onFilterKeywordChange}
                      ),

                    key: col.name,
                    fixed: col.fixed,
                    align: "center"
                  },
                  React.createElement(Column, {
                    header:
                      React.createElement(HeaderWrapper, {cellDataKey: col.name, columnData: {displayName:col.displayName,sortFlag:props.sortBy === col.name,
                        sortDirArrow:props.sortDirArrow,filterAll:props.filterAll,type:props.filters[col.name].type},
                        sortNSet: props.sortNSet, filter: props.filters[col.name],
                        shortLabel: headerShortLabels[col.name]}
                      ),

                    cell: React.createElement(CustomizeCell, {data: rows, field: col.name,
                      filterAll: props.filterAll, shortLabels: cellShortLabels,
                      tableType: props.tableType,
                      selectRow: self.selectRow,
                      selectGene: self.selectGene,
                      selectedRowIndex: selectedRowIndex,
                      selectedGeneRowIndex: selectedGeneRowIndex,
                      pieLabelMouseEnterFunc: props.pieLabelMouseEnterFunc,
                      pieLabelMouseLeaveFunc: props.pieLabelMouseLeaveFunc}
                    ),
                    width: width,
                    fixed: col.fixed,
                    allowCellsRecycling: true,
                    isResizable: props.isResizable,
                    columnKey: col.name,
                    key: col.name}
                  )
                )
              } else {
                column = React.createElement(Column, {
                  header:
                    React.createElement(HeaderWrapper, {cellDataKey: col.name, columnData: {displayName:col.displayName,sortFlag:props.sortBy === col.name,
                      sortDirArrow:props.sortDirArrow,filterAll:props.filterAll,type:props.filters[col.name].type},
                      sortNSet: props.sortNSet, filter: props.filters[col.name],
                      shortLabel: headerShortLabels[col.name]}
                    ),

                  cell: React.createElement(CustomizeCell, {data: rows, field: col.name,
                    filterAll: props.filterAll,
                    shortLabels: cellShortLabels,
                    tableType: props.tableType,
                    selectRow: self.selectRow,
                    selectGene: self.selectGene,
                    selectedRowIndex: selectedRowIndex,
                    selectedGeneRowIndex: selectedGeneRowIndex,
                    confirmedRowsIndex: confirmedRowsIndex,
                    pieLabelMouseEnterFunc: props.pieLabelMouseEnterFunc,
                    pieLabelMouseLeaveFunc: props.pieLabelMouseLeaveFunc}
                  ),
                  width: width,
                  fixed: col.fixed,
                  allowCellsRecycling: true,
                  columnKey: col.name,
                  key: col.name,
                  isResizable: props.isResizable}
                )
              }
              return (
                column
              );
            })

          )
        )
      );
    }
  });

// Root component
  var Main = React.createClass({displayName: "Main",
    SortTypes: {
      ASC: 'ASC',
      DESC: 'DESC'
    },

    rows: null,

    getColumnWidth: function(cols, rows, measureMethod, columnMinWidth) {
      var columnWidth = {};
      var self = this;
      if (self.props.autoColumnWidth) {
        var rulerWidth = 0;
        _.each(rows, function(row) {
          _.each(row, function(data, attr) {
            if (data) {
              data = data.toString();
              if (!columnWidth.hasOwnProperty(attr)) {
                columnWidth[attr] = 0;
              }
              switch (measureMethod) {
                case 'jquery':
                  var ruler = $("#ruler");
                  ruler.css('font-size', '14px');
                  ruler.text(data);
                  rulerWidth = ruler.outerWidth();
                  break;
                default:
                  var upperCaseLength = data.replace(/[^A-Z]/g, "").length;
                  var dataLength = data.length;
                  rulerWidth = upperCaseLength * 10 + (dataLength - upperCaseLength) * 8 + 15;
                  break;
              }

              columnWidth[attr] = columnWidth[attr] < rulerWidth ? rulerWidth : columnWidth[attr];
            }
          });
        });

        //20px is the padding.
        columnWidth = _.object(_.map(columnWidth, function(length, attr) {
          return [attr, length > self.props.columnMaxWidth ?
            self.props.columnMaxWidth :
            ( (length + 20) < columnMinWidth ?
              columnMinWidth : (length + 20))];
        }));
      } else {
        _.each(cols, function(col, attr) {
          columnWidth[col.name] = col.width ? col.width : 200;
        });
      }
      return columnWidth;
    },

    getShortLabels: function(rows, cols, columnWidth, measureMethod) {
      var cellShortLabels = [];
      var headerShortLabels = {};

      _.each(rows, function(row) {
        var rowWidthObj = {};
        _.each(row, function(content, attr) {
          var _label = content;
          var _labelShort = _label;
          var _labelWidth;
          if (_label) {
            _label = _label.toString();
            switch (measureMethod) {
              case 'jquery':
                var ruler = $('#ruler');
                ruler.text(_label);
                ruler.css('font-size', '14px');
                _labelWidth = ruler.outerWidth();
                break;
              default:
                var upperCaseLength = _label.replace(/[^A-Z]/g, "").length;
                var dataLength = _label.length;
                _labelWidth = upperCaseLength * 10 + (dataLength - upperCaseLength) * 8 + 15;
                break;
            }
            if (_labelWidth > columnWidth[attr]) {
              var end = Math.floor(_label.length * columnWidth[attr] / _labelWidth) - 3;
              _labelShort = _label.substring(0, end) + '...';
            } else {
              _labelShort = _label;
            }
          }
          rowWidthObj[attr] = _labelShort;
        });
        cellShortLabels.push(rowWidthObj);
      });

      _.each(cols, function(col) {
        if (!col.hasOwnProperty('show') || col.show) {
          var _label = col.displayName;
          var _shortLabel = '';
          var _labelWidth = _label.toString().length * 8 + 20;

          if (_label) {
            _label = _label.toString();
            switch (measureMethod) {
              case 'jquery':
                var ruler = $('#ruler');
                ruler.text(_label);
                ruler.css('font-size', '14px');
                ruler.css('font-weight', 'bold');
                _labelWidth = ruler.outerWidth() + 20;
                break;
              default:
                var upperCaseLength = _label.replace(/[^A-Z]/g, "").length;
                var dataLength = _label.length;
                _labelWidth = upperCaseLength * 10 + (dataLength - upperCaseLength) * 8 + 20;
                break;
            }
            if (_labelWidth > columnWidth[col.name]) {
              var end = Math.floor(_label.length * columnWidth[col.name] / _labelWidth) - 3;
              _shortLabel = _label.substring(0, end) + '...';
            } else {
              _shortLabel = _label;
            }
          }
          headerShortLabels[col.name] = _shortLabel;
        }
      });

      return {
        cell: cellShortLabels,
        header: headerShortLabels
      };
    },
    // Filters rows by selected column
    filterRowsBy: function(filterAll, filters) {
      var rows = this.rows.slice();
      var hasGroupHeader = this.props.groupHeader;
      var filterRowsStartIndex = [];
      var filteredRows = _.filter(rows, function(row, index) {
        var allFlag = false; // Current row contains the global keyword
        for (var col in filters) {
          if (!filters[col].hide) {
            if (filters[col].type == "STRING") {
              if (!row[col] && hasGroupHeader) {
                if (filters[col].key.length > 0) {
                  return false;
                }
              } else {
                if (hasGroupHeader && row[col].toLowerCase().indexOf(filters[col].key.toLowerCase()) < 0) {
                  return false;
                }
                if (row[col] && row[col].toLowerCase().indexOf(filterAll.toLowerCase()) >= 0) {
                  allFlag = true;
                }
              }
            } else if (filters[col].type === "NUMBER" || filters[col].type == 'PERCENTAGE') {
              var cell = _.isUndefined(row[col]) ? row[col] : Number(row[col].toString().replace('%', ''));
              if (!isNaN(cell)) {
                if (hasGroupHeader) {
                  if (filters[col].min !== filters[col]._min && Number(cell) < filters[col].min) {
                    return false;
                  }
                  if (filters[col].max !== filters[col]._max && Number(cell) > filters[col].max) {
                    return false;
                  }
                }
                if (row[col] && row[col].toString().toLowerCase().indexOf(filterAll.toLowerCase()) >= 0) {
                  allFlag = true;
                }
              }
            }
          }
        }
        if (allFlag) {
          filterRowsStartIndex.push(index);
        }
        return allFlag;
      });

      filteredRows = filteredRows.map(function(item, index) {
        return {
          row: item,
          index: filterRowsStartIndex[index]
        }
      });
      return filteredRows;
    },

    // Sorts rows by selected column
    sortRowsBy: function(filters, filteredRows, sortBy, switchDir) {
      var type = filters[sortBy].type, sortDir = this.state.sortDir,
        SortTypes = this.SortTypes, confirmedRowsIndex = this.getSelectedRowIndex(this.state.confirmedRows);
      if (switchDir) {
        if (sortBy === this.state.sortBy) {
          sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
        } else {
          sortDir = SortTypes.DESC;
        }
      }

      filteredRows.sort(function(a, b) {
        var sortVal = 0, aVal = a.row[sortBy], bVal = b.row[sortBy];

        if(confirmedRowsIndex.indexOf(a.index) !== -1 && confirmedRowsIndex.indexOf(b.index) === -1) {
          return -1;
        }

        if(confirmedRowsIndex.indexOf(a.index) === -1 && confirmedRowsIndex.indexOf(b.index) !== -1) {
          return 1;
        }

        if (sortBy === 'cytoband' && window.hasOwnProperty('StudyViewUtil')) {
          var _sortResult = window.StudyViewUtil.cytobanBaseSort(aVal, bVal);
          sortVal = sortDir === SortTypes.ASC ? -_sortResult : _sortResult;
        } else {

          if (type == "NUMBER") {
            aVal = (aVal && !isNaN(aVal)) ? Number(aVal) : aVal;
            bVal = (bVal && !isNaN(bVal)) ? Number(bVal) : bVal;
          }
          if (type == 'PERCENTAGE') {
            aVal = aVal ? Number(aVal.replace('%', '')) : aVal;
            bVal = bVal ? Number(bVal.replace('%', '')) : bVal;
          }
          if (typeof aVal != "undefined" && !isNaN(aVal) && typeof bVal != "undefined" && !isNaN(bVal)) {
            if (aVal > bVal) {
              sortVal = 1;
            }
            if (aVal < bVal) {
              sortVal = -1;
            }

            if (sortDir === SortTypes.ASC) {
              sortVal = sortVal * -1;
            }
          } else if (typeof aVal != "undefined" && typeof bVal != "undefined") {
            if (!isNaN(aVal)) {
              sortVal = -1;
            } else if (!isNaN(bVal)) {
              sortVal = 1;
            }
            else {
              if (aVal > bVal) {
                sortVal = 1;
              }
              if (aVal < bVal) {
                sortVal = -1;
              }

              if (sortDir === SortTypes.ASC) {
                sortVal = sortVal * -1;
              }
            }
          } else if (aVal) {
            sortVal = -1;
          }
          else {
            sortVal = 1;
          }
        }
        return -sortVal;
      });

      return {filteredRows: filteredRows, sortDir: sortDir};
    },

    // Sorts and sets state
    sortNSet: function(sortBy) {
      var result = this.sortRowsBy(this.state.filters, this.state.filteredRows, sortBy, true);
      this.setState({
        filteredRows: result.filteredRows,
        sortBy: sortBy,
        sortDir: result.sortDir
      });
    },

    // Filters, sorts and sets state
    filterSortNSet: function(filterAll, filters, sortBy) {
      var filteredRows = this.filterRowsBy(filterAll, filters);
      var result = this.sortRowsBy(filters, filteredRows, sortBy, false);
      this.setState({
        filteredRows: result.filteredRows,
        sortBy: sortBy,
        sortDir: result.sortDir,
        filterAll: filterAll,
        filters: filters
      });
    },

    // Operations when filter keyword changes
    onFilterKeywordChange: function(e) {
      ++this.state.filterTimer;

      //Disable event pooling in react, see https://goo.gl/1mq6qI
      e.persist();

      var self = this;
      var id = setTimeout(function() {
        var filterAll = self.state.filterAll, filters = self.state.filters;
        if (e.target.getAttribute("data-column") == "all") {
          filterAll = e.target.value;
        } else {
          filters[e.target.getAttribute("data-column")].key = e.target.value;
        }
        self.filterSortNSet(filterAll, filters, self.state.sortBy);
        --self.state.filterTimer;
      }, 500);

      if (this.state.filterTimer > 1) {
        clearTimeout(id);
        --self.state.filterTimer;
      }
    },

    // Operations when filter range changes
    onFilterRangeChange: function(column, min, max) {
      ++this.state.filterTimer;

      var self = this;
      var id = setTimeout(function() {
        var filters = self.state.filters;
        filters[column].min = min;
        filters[column].max = max;
        self.filterSortNSet(self.state.filterAll, filters, self.state.sortBy);
        --self.state.filterTimer;
      }, 500);

      if (this.state.filterTimer > 1) {
        clearTimeout(id);
        --self.state.filterTimer;
      }
    },

    // Operations when reset all filters
    onResetFilters: function() {
      var filters = this.state.filters;
      _.each(filters, function(filter) {
        if (!_.isUndefined(filter._key)) {
          filter.key = filter._key;
        }
        if (!_.isUndefined(filter._min)) {
          filter.min = filter._min;
        }
        if (!_.isUndefined(filter._max)) {
          filter.max = filter._max;
        }
        filter.reset = true;
      });
      if (this.props.groupHeader) {
        this.registerSliders();
      }
      this.filterSortNSet('', filters, this.state.sortBy);
    },

    updateCols: function(cols, filters) {
      var filteredRows = this.filterRowsBy(this.state.filterAll, filters);
      var result = this.sortRowsBy(filters, filteredRows, this.state.sortBy, false);
      this.setState({
        cols: cols,
        filteredRows: result.filteredRows,
        filters: filters
      });
      if (this.props.groupHeader) {
        this.registerSliders();
      }
    },

    updateGoToColumn: function(val) {
      this.setState({
        goToColumn: val
      });
    },

    registerSliders: function() {
      var onFilterRangeChange = this.onFilterRangeChange;
      $('.rangeSlider')
        .each(function() {
          var min = Math.floor(Number($(this).attr('data-min')) * 100) / 100, max = (Math.ceil(Number($(this).attr('data-max')) * 100)) / 100,
            column = $(this).attr('data-column'), diff = max - min, step = 1;
          var type = $(this).attr('data-type');

          if (diff < 0.01) {
            step = 0.001;
          } else if (diff < 0.1) {
            step = 0.01;
          } else if (diff < 2) {
            step = 0.1;
          }

          $(this).slider({
            range: true,
            min: min,
            max: max,
            step: step,
            values: [min, max],
            change: function(event, ui) {
              $("#range-" + column).text(ui.values[0] + " to " + ui.values[1]);
              onFilterRangeChange(column, ui.values[0], ui.values[1]);
            }
          });
          if (type === 'PERCENTAGE') {
            $("#range-" + column).text(min + "% to " + max + '%');
          } else {
            $("#range-" + column).text(min + " to " + max);
          }
        });
    },
    // Processes input data, and initializes table states
    getInitialState: function() {
      var state = this.parseInputData(this.props.input, this.props.uniqueId,
        this.props.selectedRows, this.props.groupHeader, this.props.columnSorting);

      state.confirmedRows = ['mutatedGene', 'cna'].indexOf(this.props.tableType) !== -1 ? state.selectedRows : [];
      state.filteredRows = null;
      state.filterAll = "";
      state.sortBy = this.props.sortBy || 'samples';
      state.goToColumn = null;
      state.filterTimer = 0;
      state.sortDir = this.props.sortDir || this.SortTypes.DESC;
      state.rowClickFunc = this.rowClickCallback;
      state.selectButtonClickCallback = this.selectButtonClickCallback;
      return state;
    },

    rowClickCallback: function(selectedRows, isSelected, allSelectedRows) {
      var uniqueId = this.props.uniqueId;
      this.setState({
        selectedRows: allSelectedRows.map(function(item) {
          return item[uniqueId];
        })
      });
      if(_.isFunction(this.props.rowClickFunc)) {
        this.props.rowClickFunc(selectedRows, isSelected, allSelectedRows);
      }
    },

    selectButtonClickCallback: function() {
      var selectedRows = this.state.selectedRows;
      this.setState({
        confirmedRows: selectedRows
      });
      if(_.isFunction(this.props.selectButtonClickCallback)) {
        this.props.selectButtonClickCallback();
      }
    },

    getSelectedRowIndex: function(selectedRows) {
      var selectedRowIndex = [];
      var uniqueId = this.props.uniqueId;
      _.each(this.rows, function(row, index) {
        if (selectedRows.indexOf(row[uniqueId]) !== -1) {
          selectedRowIndex.push(index);
        }
      })
      return selectedRowIndex;
    },

    getSelectedGeneRowIndex: function(selectedGene) {
      var selectedGeneRowIndex = [];
      _.each(this.rows, function(row, index) {
        if (selectedGene.indexOf(row.gene) !== -1) {
          selectedGeneRowIndex.push(index);
        }
      })
      return selectedGeneRowIndex;
    },

    // Initializes filteredRows before first rendering
    componentWillMount: function() {
      this.filterSortNSet(this.state.filterAll, this.state.filters, this.state.sortBy);
    },

    parseInputData: function(input, uniqueId, selectedRows, groupHeader, columnSorting) {
      var cols = [], rows = [], rowsDict = {}, attributes = input.attributes,
        data = input.data, dataLength = data.length, col, cell, i, filters = {},
        uniqueId = uniqueId || 'id', newCol,
        selectedRows = selectedRows || [],
        measureMethod = (dataLength > 100000 || !this.props.autoColumnWidth) ? 'charNum' : 'jquery',
        columnMinWidth = groupHeader ? 130 : 50; //The minimum width to at least fit in number slider.
      var selectedRowIndex = [];

      // Gets column info from input
      var colsDict = {};
      for (i = 0; i < attributes.length; i++) {
        col = attributes[i];
        newCol = {
          displayName: col.display_name,
          name: col.attr_id,
          type: col.datatype,
          fixed: false,
          show: true
        };

        if (col.hasOwnProperty('column_width')) {
          newCol.width = col.column_width;
        }

        if (_.isBoolean(col.show)) {
          newCol.show = col.show;
        }

        if (_.isBoolean(col.fixed)) {
          newCol.fixed = col.fixed;
        }

        cols.push(newCol);
        colsDict[col.attr_id] = i;
      }

      // Gets data rows from input
      for (i = 0; i < dataLength; i++) {
        cell = data[i];
        if (!rowsDict[cell[uniqueId]]) {
          rowsDict[cell[uniqueId]] = {};
        }
        rowsDict[cell[uniqueId]][cell.attr_id] = cell.attr_val;
      }

      var index = 0;
      _.each(rowsDict, function(item, i) {
        rowsDict[i][uniqueId] = i;
        rows.push(rowsDict[i]);
        if (selectedRows.indexOf(i) !== -1) {
          selectedRowIndex.push(index);
        }
        ++index;
      });

      // Gets the range of number type features
      for (i = 0; i < cols.length; i++) {
        col = cols[i];
        var _filter = {
          type: col.type,
          hide: !col.show
        };

        if (col.type == "NUMBER" || col.type == "PERCENTAGE") {
          var min = Number.MAX_VALUE, max = -Number.MAX_VALUE;
          for (var j = 0; j < rows.length; j++) {
            cell = _.isUndefined(rows[j][col.name]) ? rows[j][col.name] : rows[j][col.name].toString().replace('%');
            if (typeof cell != "undefined" && !isNaN(cell)) {
              cell = Number(cell);
              max = cell > max ? cell : max;
              min = cell < min ? cell : min;
            }
          }
          if (max === -Number.MAX_VALUE || min === Number.MIN_VALUE) {
            _filter.key = '';
            _filter._key = '';
          } else {
            col.max = max;
            col.min = min;
            _filter.min = min;
            _filter.max = max;
            _filter._min = min;
            _filter._max = max;
          }
        } else {
          _filter.key = '';
          _filter._key = '';
        }
        filters[col.name] = _filter;
      }

      if (columnSorting) {
        cols = _.sortBy(cols, function(obj) {
          if (!_.isUndefined(obj.displayName)) {
            return obj.displayName;
          } else {
            return obj.name;
          }
        });
      }
      this.rows = rows;

      var columnWidths = this.getColumnWidth(cols, rows, measureMethod, columnMinWidth);
      var shortLabels = this.getShortLabels(rows, cols, columnWidths, measureMethod);

      return {
        cols: cols,
        rowsSize: rows.length,
        filters: filters,
        shortLabels: shortLabels,
        columnWidths: columnWidths,
        columnMinWidth: columnMinWidth,
        selectedRowIndex: selectedRowIndex,
        selectedRows: selectedRows,
        dataSize: dataLength,
        measureMethod: measureMethod
      };
    },
    // If properties changed
    componentWillReceiveProps: function(newProps) {
      var state = this.parseInputData(newProps.input, newProps.uniqueId,
        newProps.selectedRows, newProps.groupHeader, newProps.columnSorting);
      state.confirmedRows = ['mutatedGene', 'cna'].indexOf(newProps.tableType) !== -1 ? state.selectedRows : [];
      state.filteredRows = null;
      state.filterAll = this.state.filterAll || '';
      state.sortBy = this.props.sortBy || 'samples';
      state.sortDir = this.props.sortDir || this.SortTypes.DESC;
      state.goToColumn = null;
      state.filterTimer = 0;

      var filteredRows = this.filterRowsBy(state.filterAll, state.filters);
      var result = this.sortRowsBy(state.filters, filteredRows, state.sortBy, false);
      state.filteredRows = result.filteredRows;

      this.setState(state);
    },

    //Will be triggered if the column width has been changed
    onColumnResizeEndCallback: function(width, key) {
      var foundMatch = false;
      var cols = this.state.cols;

      _.each(cols, function(col, attr) {
        if (col.name === key) {
          col.width = width;
          foundMatch = true;
        }
      });
      if (foundMatch) {
        var columnWidths = this.state.columnWidths;
        columnWidths[key] = width;
        var shortLabels = this.getShortLabels(this.rows, cols, columnWidths, this.state.measureMethod);
        this.setState({
          columnWidths: columnWidths,
          shortLabels: shortLabels,
          cols: cols
        });
      }
    },

    // Activates range sliders after first rendering
    componentDidMount: function() {
      if (this.props.groupHeader) {
        this.registerSliders();
      }
    },

    // Sets default properties
    getDefaultProps: function() {
      return {
        filter: "NONE",
        download: "NONE",
        showHide: false,
        hideFilter: true,
        scroller: false,
        resultInfo: true,
        groupHeader: true,
        downloadFileName: 'data.txt',
        autoColumnWidth: true,
        columnMaxWidth: 300,
        columnSorting: true,
        tableType: 'mutatedGene',
        selectedRows: [],
        selectedGene: [],
        sortBy: 'samples',
        sortDir: 'DESC',
        isResizable: false
      };
    },

    render: function() {
      var sortDirArrow = this.state.sortDir === this.SortTypes.DESC ? 'fa fa-sort-desc' : 'fa fa-sort-asc';
      var selectedGeneRowIndex = this.getSelectedGeneRowIndex(this.props.selectedGene);
      var selectedRowIndex = this.getSelectedRowIndex(this.state.selectedRows);
      var confirmedRowsIndex = this.getSelectedRowIndex(this.state.confirmedRows);
      return (
        React.createElement("div", {className: "EFDT-table"},
          React.createElement("div", {className: "EFDT-table-prefix"},
            React.createElement(TablePrefix, {cols: this.state.cols, rows: this.rows,
              onFilterKeywordChange: this.onFilterKeywordChange,
              onResetFilters: this.onResetFilters,
              filters: this.state.filters,
              updateCols: this.updateCols,
              updateGoToColumn: this.updateGoToColumn,
              scroller: this.props.scroller,
              filter: this.props.filter,
              hideFilter: this.props.hideFilter,
              getData: this.props.download,
              downloadFileName: this.props.downloadFileName,
              hider: this.props.showHide,
              fixedChoose: this.props.fixedChoose,
              resultInfo: this.props.resultInfo,
              rowsSize: this.state.rowsSize,
              filteredRowsSize: this.state.filteredRows.length}
            )
          ),
          React.createElement("div", {className: "EFDT-tableMain"},
            React.createElement(TableMainPart, {cols: this.state.cols,
              rows: this.rows,
              filteredRows: this.state.filteredRows,
              filters: this.state.filters,
              sortNSet: this.sortNSet,
              onFilterKeywordChange: this.onFilterKeywordChange,
              goToColumn: this.state.goToColumn,
              sortBy: this.state.sortBy,
              sortDirArrow: sortDirArrow,
              filterAll: this.state.filterAll,
              filter: this.props.filter,
              rowHeight: this.props.rowHeight,
              tableWidth: this.props.tableWidth,
              maxHeight: this.props.maxHeight,
              headerHeight: this.props.headerHeight,
              groupHeaderHeight: this.props.groupHeaderHeight,
              groupHeader: this.props.groupHeader,
              tableType: this.props.tableType,
              confirmedRowsIndex: confirmedRowsIndex,
              shortLabels: this.state.shortLabels,
              columnWidths: this.state.columnWidths,
              rowClickFunc: this.state.rowClickFunc,
              geneClickFunc: this.props.geneClickFunc,
              selectButtonClickCallback: this.state.selectButtonClickCallback,
              pieLabelMouseEnterFunc: this.props.pieLabelMouseEnterFunc,
              pieLabelMouseLeaveFunc: this.props.pieLabelMouseLeaveFunc,
              selectedRowIndex: selectedRowIndex,
              selectedGeneRowIndex: selectedGeneRowIndex,
              isResizable: this.props.isResizable,
              onColumnResizeEndCallback: this.onColumnResizeEndCallback}
            )
          ),
          React.createElement("div", {className: "EFDT-filter"},

            (this.props.filter === "ALL" || this.props.filter === "GLOBAL") ?
              React.createElement(Filter, {type: "STRING", name: "all",
                onFilterKeywordChange: this.onFilterKeywordChange}) :
              React.createElement("div", null)

          ),
          React.createElement("div", {className: "EFDT-finish-selection-button"},

            (['mutatedGene', 'cna'].indexOf(this.props.tableType) !== -1 && this.state.selectedRows.length > 0 && this.state.confirmedRows.length !== this.state.selectedRows.length ) ?
              React.createElement("button", {className: "btn btn-default btn-xs", onClick: this.state.selectButtonClickCallback}, "Select") : ''

          )
        )
      );
    }
  });

  return Main;
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
/**
 * Created by kalletlak on 7/8/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  var headerCaseSelectCustomDialog = {
    id: 'iviz-case-select-custom-dialog', // Since we're only creating one modal, give it an ID so we can style it
      content: {
      text: '',
        title: {
        text: 'Custom case selection',
          button: true
      }
    },
    position: {
      my: 'center', // ...at the center of the viewport
        at: 'center',
        target: ''
    },
    show: {
      event: 'click', // Show it on click...
        solo: true // ...and hide all other tooltips...
    },
    hide: false,
      style: 'qtip-light qtip-rounded qtip-wide'
  };
  Vue.component('customCaseInput', {
    template: '<input type="button" id="iviz-header-right-1" class="iviz-header-button" value="Select cases by IDs"/>' +
    '<div class="iviz-hidden" id="iviz-case-select-custom-dialog">' +
    '<b>Please input IDs (one per line)</b><textarea rows="20" cols="50" id="iviz-case-select-custom-input" v-model="casesIdsList"></textarea><br/>' +
    '<label><input type="radio" v-model="caseSelection" value="sample" checked>' +
    'By sample ID</label><label><input type="radio" v-model="caseSelection" value="patient">' +
    'By patient ID</label><button type="button" @click="SetCasesSelection()" style="float: right;">Select</button></div>',
    props: [
      
    ],
    data: function() {
      return {
        caseSelection:'',
        casesIdsList:''
      }
    },
    events: {
    },
    methods: {
      SetCasesSelection: function(){
        var  caseIds = this.casesIdsList.trim().split(/\s+/);
        this.$dispatch('set-selected-cases',this.caseSelection,caseIds)
      }
    },
    ready: function() {
      var _customDialogQtip = jQuery.extend(true, {}, headerCaseSelectCustomDialog);
      _customDialogQtip.position.target = $(window);
      _customDialogQtip.content.text = $('#iviz-case-select-custom-dialog');
      $('#iviz-header-right-1').qtip(_customDialogQtip);
    }
  });
})(window.Vue, window.dc, window.iViz,
  window.$ || window.jQuery);
