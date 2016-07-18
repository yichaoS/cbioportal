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

package org.mskcc.cbio.portal.servlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.mskcc.cbio.portal.dao.DaoCancerStudy;
import org.mskcc.cbio.portal.dao.DaoException;
import org.mskcc.cbio.portal.dao.DaoSampleList;
import org.mskcc.cbio.portal.model.CancerStudy;
import org.mskcc.cbio.portal.model.Cohort;
import org.mskcc.cbio.portal.model.CohortStudyCasesMap;
import org.mskcc.cbio.portal.model.GeneticProfile;
import org.mskcc.cbio.portal.model.SampleList;
import org.mskcc.cbio.portal.util.AccessControl;
import org.mskcc.cbio.portal.util.SessionServiceUtil;
import org.mskcc.cbio.portal.util.SpringUtil;
import org.mskcc.cbio.portal.util.XDebug;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 *
 * @author jj
 */

public class CancerStudyView extends HttpServlet {
    private static Logger logger = Logger.getLogger(CancerStudyView.class);
    public static final String ID = "id";
    public static final String ERROR = "error";
    public static final String COHORTS = "cohorts";
    public static final String MUTATION_PROFILE_IDS = "mutation_profile";
    public static final String CNA_PROFILE_IDS = "cna_profile";
    public static final String STUDY_SAMPLE_MAP = "study_sample_map";
    
    private static final DaoSampleList daoSampleList = new DaoSampleList();

    // class which process access control to cancer studies
    private AccessControl accessControl;

    /**
     * Initializes the servlet.
     *
     * @throws ServletException Serlvet Init Error.
     */
    @Override
    public void init() throws ServletException {
        super.init();
		accessControl = SpringUtil.getAccessControl();
    }
    
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        XDebug xdebug = new XDebug( request );
        request.setAttribute(QueryBuilder.XDEBUG_OBJECT, xdebug);

        try {
            if (validate(request)) {
               setGeneticProfiles(request);
            }
            
            if (request.getAttribute(ERROR)!=null) {
                forwardToErrorPage(request, response, (String)request.getAttribute(ERROR), xdebug);
            } else {
                RequestDispatcher dispatcher =
                        getServletContext().getRequestDispatcher("/WEB-INF/jsp/study_view/cancer_study_view.jsp");
                dispatcher.forward(request, response);
            }
        
        } catch (DaoException e) {
            xdebug.logMsg(this, "Got Database Exception:  " + e.getMessage());
            forwardToErrorPage(request, response,
                               "An error occurred while trying to connect to the database.", xdebug);
        } 
    }

    private CancerStudy getCancerStudyDetails(String cancerStudyId){
    	CancerStudy cancerStudy = null;
		try {
			cancerStudy = DaoCancerStudy
			        .getCancerStudyByStableId(cancerStudyId);
			if (cancerStudy==null) {
                cancerStudy = DaoCancerStudy.getCancerStudyByInternalId(
                        Integer.parseInt(cancerStudyId));
			}
		} catch(NumberFormatException ex) {}
		catch (DaoException e) {}
    	return cancerStudy;
    }
    
    private void addCohortToMap(Map<String, Set<String>> studySampleMap, String cancerStudyId, Set<String> sampleIds) throws DaoException{
			if (accessControl.isAccessibleCancerStudy(cancerStudyId).size() == 1) {
			        UserDetails ud = accessControl.getUserDetails();
			        if (ud != null) {
			            logger.info("CancerStudyView.validate: Query initiated by user: " + ud.getUsername()+" : Study: "+cancerStudyId);
			        }
			        
			        if(studySampleMap.containsKey(cancerStudyId)){
						Set<String> sampleIdsTemp = studySampleMap.get(cancerStudyId);
						if(sampleIds.size() == 0){
							SampleList sampleList = daoSampleList.getSampleListByStableId(cancerStudyId+"_all");
							sampleIds = new HashSet<String>(sampleList.getSampleList());
						}
						sampleIdsTemp.retainAll(sampleIds);
						studySampleMap.put(cancerStudyId, sampleIdsTemp);
					}else{
						if(sampleIds.size() == 0){
							SampleList sampleList = daoSampleList.getSampleListByStableId(cancerStudyId+"_all");
							sampleIds = new HashSet<String>(sampleList.getSampleList());
						}
						studySampleMap.put(cancerStudyId, sampleIds);
					}
			  }
			
    }
    
    private boolean validate(HttpServletRequest request) throws DaoException, JsonProcessingException, IOException {
        String cohortIds = request.getParameter(COHORTS);
        
        if (cohortIds==null) {
        	 request.setAttribute(ERROR, "No such cancer study");
        	 return false;
        }
        String [] cohortIdsList = cohortIds.split(",");
        Map<String, Cohort> cohortMap = new HashMap<String, Cohort>();
        SessionServiceUtil sessionServiceUtil = new SessionServiceUtil();
        Set<String> unknownStudyIds = new HashSet<>();
        Set<String> unAuthorizedStudyIds = new HashSet<>();
        Map<String, Set<String>> studySampleMap = new HashMap<String, Set<String>>();
        
        for(String cohortId : cohortIdsList){
        	 CancerStudy cancerStudy = getCancerStudyDetails(cohortId);
		        if (cancerStudy==null) {
		        	Cohort virtualCohort = sessionServiceUtil.getVirtualCohortData(cohortId);
		        	if(virtualCohort != null){
		        		cohortMap.put(virtualCohort.getId(), virtualCohort);
		        	}else{
		        		unknownStudyIds.add(cohortId);
		        	}
		        }else{
		        	Cohort cohort = new Cohort();
		        	cohort.setStudyName(cancerStudy.getName());
		        	cohort.setId(cancerStudy.getCancerStudyStableId());
		        	cohort.setDescription(cancerStudy.getDescription());
		        	cohort.setVirtualCohort(false);
		        	cohortMap.put(cohort.getId(), cohort);
		        }
        }
		
		for(String cohortId:cohortMap.keySet()){
			Cohort cohort = cohortMap.get(cohortId);
			if(cohort.isVirtualCohort()){
				for(CohortStudyCasesMap cohortStudyCasesMap: cohort.getCohortStudyCasesMap()){
					 CancerStudy cancerStudy = getCancerStudyDetails(cohortStudyCasesMap.getStudyID());
					 if(cancerStudy != null){
						 addCohortToMap(studySampleMap,cohortStudyCasesMap.getStudyID(),cohortStudyCasesMap.getSamples());
					 }
				}
			}else{
				addCohortToMap(studySampleMap,cohort.getId(),new HashSet<String>());
			}
		}
		//TODO: need to update logic if there are multiple unknown/ unauthorized studies
		if(studySampleMap.size() == 0){
			if(unknownStudyIds.size() > 0){
				request.setAttribute(ERROR, "No such cohort(s): "+StringUtils.join(unknownStudyIds,","));
				return false;
			}
			/*if(unAuthorizedStudyIds.size() > 0){
				request.setAttribute(ERROR,
	                    "You are not authorized to view the cohort with id: '" +
	                    		unAuthorizedStudyIds.iterator().next() + "'. ");
				return false;
			}*/
		}else{
			if(cohortMap.size() ==1){
				request.setAttribute(QueryBuilder.HTML_TITLE,cohortMap.get(cohortMap.keySet().iterator().next()).getStudyName());
				request.setAttribute("COHORT",cohortMap.get(cohortMap.keySet().iterator().next()));
			}else{
				request.setAttribute(QueryBuilder.HTML_TITLE, "Summary");
			}
		}
		ObjectMapper mapper = new ObjectMapper();
		String studySampleMapString = mapper.writeValueAsString(studySampleMap);
		request.setAttribute(STUDY_SAMPLE_MAP, studySampleMapString);
		request.setAttribute(QueryBuilder.CANCER_STUDY_LIST, studySampleMap.keySet());
		return true;
    }
    
    private void setGeneticProfiles(HttpServletRequest request) throws DaoException {
    	Set<String> cancerStudyIds = (Set<String>)request.getAttribute(QueryBuilder.CANCER_STUDY_LIST);
    	Set<String> mutationProfileIds = new HashSet<String>();
    	Set<String> cnaProfileIds = new HashSet<String>();
    	for(String cancerStudyId : cancerStudyIds){
    		CancerStudy cancerStudy = DaoCancerStudy
			        .getCancerStudyByStableId(cancerStudyId);
    		  GeneticProfile mutProfile = cancerStudy.getMutationProfile();
    		  if (mutProfile!=null) {
    			  mutationProfileIds.add(mutProfile.getStableId());
    	          //  request.setAttribute(MUTATION_PROFILE, mutProfile);
    	        }
    	        
    	        GeneticProfile cnaProfile = cancerStudy.getCopyNumberAlterationProfile(true);
    	        if (cnaProfile!=null) {
    	        	cnaProfileIds.add(cnaProfile.getStableId());
    	            //request.setAttribute(CNA_PROFILE, cnaProfile);
    	        }
    	}
    	
    	request.setAttribute(MUTATION_PROFILE_IDS, mutationProfileIds);
    	request.setAttribute(CNA_PROFILE_IDS, cnaProfileIds);
        
    }
    
    private void forwardToErrorPage(HttpServletRequest request, HttpServletResponse response,
                                    String userMessage, XDebug xdebug)
            throws ServletException, IOException {
        request.setAttribute("xdebug_object", xdebug);
        request.setAttribute(QueryBuilder.USER_ERROR_MESSAGE, userMessage);
        RequestDispatcher dispatcher =
                getServletContext().getRequestDispatcher("/WEB-INF/jsp/error.jsp");
        dispatcher.forward(request, response);
    }
    
    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /** 
     * Handles the HTTP <code>GET</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Handles the HTTP <code>POST</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Returns a short description of the servlet.
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
