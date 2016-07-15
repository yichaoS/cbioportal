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
package org.mskcc.cbio.portal.util;

import org.mskcc.cbio.portal.model.Cohort;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
*
* @author Karthik Kalletla
*/
public class SessionServiceUtil {
	
	public Cohort getVirtualCohortData(String virtualStudyId){
		// Map<String, Set<String>> cohortMap = new HashMap<String, Set<String>>();
		 String url = GlobalProperties.getSessionServiceUrl()
					+ GlobalProperties.getSessionServiceSource() + "/virtual_cohort/";
			RestTemplate restTemplate = new RestTemplate();
			ObjectMapper mapper = new ObjectMapper();
			JsonNode actualObj = null;
			Cohort virtualCohort =null;
			try {
				String result = restTemplate.getForObject(url + virtualStudyId, String.class);
			
				actualObj = mapper.readTree(result);
				virtualCohort = mapper.convertValue(actualObj.get("data").get("virtualCohort"),Cohort.class);
				virtualCohort.setVirtualCohort(true);
				virtualCohort.setId(virtualStudyId);

				/*CollectionType accountListType2 =  mapper.getTypeFactory().constructCollectionType(List.class, VCStudyCasesMap.class);
				List<VCStudyCasesMap> virtualStudyCasesMapList = mapper.readValue(actualObj.get("data").get("virtualCohort").get("selectedCases").toString(), accountListType2);
				for(VCStudyCasesMap tempMap : virtualStudyCasesMapList){
					if(cohortMap.containsKey(tempMap.getStudyID())){
						Set<String> sampleIds = cohortMap.get(tempMap.getStudyID());
						sampleIds.addAll(tempMap.getSamples());
						cohortMap.put(tempMap.getStudyID(), sampleIds);
						
					}else{
						cohortMap.put(tempMap.getStudyID(), tempMap.getSamples());
					}
				}*/
			} catch(HttpStatusCodeException e) {
			}catch(Exception e){
			}
		return virtualCohort;
	}

}
