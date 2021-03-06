package org.cbioportal.web.error;

import org.cbioportal.service.exception.CancerTypeNotFoundException;
import org.cbioportal.service.exception.GeneNotFoundException;
import org.cbioportal.service.exception.GeneticProfileNotFoundException;
import org.cbioportal.service.exception.PatientNotFoundException;
import org.cbioportal.service.exception.SampleListNotFoundException;
import org.cbioportal.service.exception.SampleNotFoundException;
import org.cbioportal.service.exception.StudyNotFoundException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.ElementKind;
import javax.validation.Path;
import java.util.Iterator;

@ControllerAdvice("org.cbioportal.web")
public class GlobalExceptionHandler {

    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedOperation() {

        return new ResponseEntity<>(new ErrorResponse("Requested API is not implemented yet"),
                HttpStatus.NOT_IMPLEMENTED);
    }

    @ExceptionHandler(StudyNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStudyNotFound(StudyNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Study not found: " + ex.getStudyId()),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePatientNotFound(PatientNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Patient not found in study " + ex.getStudyId() + ": " +
            ex.getPatientId()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CancerTypeNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCancerTypeNotFound(CancerTypeNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Cancer type not found: " + ex.getCancerTypeId()),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(GeneticProfileNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleGeneticProfileNotFound(GeneticProfileNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Genetic profile not found: " + ex.getGeneticProfileId()),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(SampleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleSampleNotFound(SampleNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Sample not found in study " + ex.getStudyId() + ": " +
                ex.getSampleId()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(GeneNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleGeneNotFound(GeneNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Gene not found: " + ex.getGeneId()),
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(SampleListNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleSampleListNotFound(SampleListNotFoundException ex) {

        return new ResponseEntity<>(new ErrorResponse("Sample list not found: " + ex.getSampleListId()),
            HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex) {

        return new ResponseEntity<>(new ErrorResponse("Request parameter is missing: " + ex.getParameterName()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(TypeMismatchException ex) {

        return new ResponseEntity<>(new ErrorResponse("Request parameter type mismatch: " + ex.getMostSpecificCause()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {

        return new ResponseEntity<>(new ErrorResponse("There is an error in the JSON format of the request payload"),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {

        ConstraintViolation constraintViolation = ex.getConstraintViolations().iterator().next();
        Iterator<Path.Node> iterator = constraintViolation.getPropertyPath().iterator();
        String parameterName = null;
        
        while (iterator.hasNext()) {
            Path.Node node = iterator.next();
            if (node.getKind() == ElementKind.PARAMETER) {
                parameterName = node.getName();
                break;
            }
        }

        return new ResponseEntity<>(new ErrorResponse(parameterName + " " + constraintViolation.getMessage()),
            HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        
        FieldError fieldError = ex.getBindingResult().getFieldError();
        return new ResponseEntity<>(new ErrorResponse(fieldError.getField() + " " + fieldError.getDefaultMessage()),
            HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {

        return new ResponseEntity<>(new ErrorResponse("Access to the specified resource has been forbidden"),
            HttpStatus.FORBIDDEN);
    }
}
