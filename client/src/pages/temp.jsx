import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TextField from '@mui/material/TextField';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import FileBase from 'react-file-base64';
import Grid from '@mui/material/Grid';
import { openBase64NewTab } from '../utils/base64topdf';
import EditIcon from '@mui/icons-material/Edit';
import { convertBackendDateToPickerFormat } from '../utils/DateConvertToFrontend';
import { handleFileErrors,handleFormErrors } from '../utils/ErrorFunctions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LinearProgress , CircularProgress } from '@mui/material';
import { decodeAuthToken } from '../utils/AdminFunctions';

const API_URL = import.meta.env.VITE_ENV === 'production' ? import.meta.env.VITE_PROD_BASE_URL : import.meta.env.VITE_DEV_BASE_URL

export default function PlacementForm() {
  const [formData, setFormData] = useState({
    company: '',
    placementType: '',
    highStudy: '',
    appointmentNo: '',
    appointmentLetter: null,
    package: '',
    designation: '',
    gateStatus: '',
    gateCertificate: '',
    appointmentDate: '',
    isPlaced: null,
    highStudyplace: ''
  });
  // const [isPlaced, setIsPlaced] = useState("");
  const [AppointmentDate,SetAppointmentDate]=useState({})
  // const [isHighstudy, setHighstudy] = useState("No");
  // const [gateStatus, setgateStatus] = useState("No");
  // const [Gatefiledata, setGateFiledata] = useState({})
  // const [Appointmentfiledata, setAppointmentFiledata] = useState({})
  const [highStudyplace, sethighStudyplace] = useState("");
  // const token = localStorage.getItem("authtoken");
  // const crn = decodeAuthToken(token);
  const [errors, setErrors] = useState({});
  const [appointmentLetter, setAppointmentLetter] = useState(null);
  const [GateCertificate, setGateCertificate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [isLock, setIsLock] = useState(false);
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authtoken');
        const url = `${API_URL}placement/${crn}`;
        const response = await axios.get(url, {
          headers: {
            "auth-token": token
          }
        });
        const userData = response.data.data;

        // Check if all required fields are present in the fetched data
        if (userData.highStudy && userData.gateStatus) {
          // Convert the appointment date to date picker format
          const formattedAppointmentDate = convertBackendDateToPickerFormat(userData.appointmentDate);
          
          // Set form data with fetched values
            // setFormData({
            //   ...userData,
            //   appointmentDate: formattedAppointmentDate,
            // });
            console.log("userdata",userData)
          SetAppointmentDate(formattedAppointmentDate)
          // Set other state variables
          // setIsLock(userData.lock || false);
          // setIsPlaced(userData.isPlaced ? "true" : "false");
          // setHighstudy(userData.highStudy);
          // setgateStatus(userData.gateStatus);
          sethighStudyplace(userData.highStudyplace)
          setGateCertificate(userData.gateCertificate);
          setAppointmentLetter(userData.appointmentLetter);
          setIsEditing(false);
          // setFormData({ ...formData, 'isPlaced': userData.isPlaced, 'gateStatus': userData.gateStatus, 'highStudy': userData.highStudy })
          // console.log(formData)
        } else {
          console.error('Error: Fetched data is incomplete.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false)
      } finally {
        setLoading(false)
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (newDate) => {
    // Extract year, month, and day from the selected date
    SetAppointmentDate(newDate)
    const year = newDate.$y;
    const month = newDate.$M + 1; // Months start from 0, so add 1
    const day = newDate.$D;

    // Format the date string
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    setFormData({ ...formData, appointmentDate: formattedDate });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Dynamic regex and validation check messages
    let regex;
    let errorMsg;
    switch (name) {
      case 'contact':
        regex = /^\d{10}$/;
        errorMsg = 'Contact must be 10 digits';
        break;
      case 'crn':
        regex = /^\d{7}$/;
        errorMsg = 'CRN must be a 7-digit number';
        break;
      default:
        break;
    }
    if (regex && !regex.test(value)) {
      setErrors({ ...errors, [name]: errorMsg });
    } else {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    setErrors({});
    try {
      const formErrors = handleFormErrors(formData,isHighstudy);
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setLoading(false)
        return;
      }

      // Validate file uploads
      if(formData.isPlaced!==null ){
      const fileErrors = handleFileErrors(Appointmentfiledata);
      if (Object.keys(fileErrors).length > 0) {
        // Display file-related errors
        setErrors({ ...errors, ...fileErrors });
        setLoading(false)
        return;
      }
      }
      if (formData.gateStatus ==="Yes"){
        const fileErrors = handleFileErrors( Gatefiledata);
        if (Object.keys(fileErrors).length > 0) {
          // Display file-related errors
          setErrors({ ...errors, ...fileErrors });
          setLoading(false)
          return;
        }
      }
      resetValues()
      console.log("formdata",formData)
      const token = localStorage.getItem('authtoken');
      // Submit form data
      const response = await axios.post(`${API_URL}placement`, {
        formData: formData,
        crn: crn,
      },
        {
          headers: {
            "auth-token": token
          }
        });

      if (response.data.success) {
        toast.success('Placement details submitted successfully!');
        setIsSubmitting(false);
        setIsEditing(false);
        setLoading(false)
        setGateFiledata({})
        setAppointmentFiledata({})
      } else {
        toast.error('Failed to submit placement details. Please try again later.');
        setIsSubmitting(false);
        setLoading(false)
        setGateFiledata({})
        setAppointmentFiledata({})
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('An error occurred while submitting the placement details.');
      setIsSubmitting(false);
      setLoading(false)
      setGateFiledata({})
      setAppointmentFiledata({})
    }
  };

  const handleAppointmentFileChange = (files) => {
    setAppointmentFiledata(files)
    setFormData({ ...formData, appointmentLetter: files.base64 });
    setAppointmentLetter(files.base64);
  };
  const handleGateFileChange = (files) => {
    setGateFiledata(files)
    setFormData({ ...formData, gateCertificate: files.base64 });
    setGateCertificate(files.base64);
  };

  const handleEdit = () => {
    setIsEditing((prevEditing) => !prevEditing);
  };

  const handleViewCertificate = (data) => {
    if (data) {
      openBase64NewTab(data);
    } else {
      openBase64NewTab(formData.data);
    }
  };


  const handleIsPlacedChange = (e) => {
    const { name, value } = e.target;
    setIsPlaced(value)
    if (value) {
      let newvalue = (value === "true")
      setFormData({ ...formData, [name]: newvalue });
    }

  };

  const handleIsHighChange = (e) => {
    // console.log(e.target)
    const { name, value } = e.target;
    setHighstudy(value);

    setFormData({ ...formData, [name]: value });
  };
  const handleIsGateStatusChange = (e) => {
    // console.log(e.target)
    const { name, value } = e.target;
    setgateStatus(value);

    setFormData({ ...formData, [name]: value });
  };
  const handlehighStudyplace = (e) => {
    // console.log(e.target)
    const { name, value } = e.target;
    sethighStudyplace(value);

    setFormData({ ...formData, [name]: value });

  }; 
  const resetValues = () => {
    // Reset form values based on isPlaced state
    if (formData.isPlaced !== true) {
      console.log("hello")
      setFormData({
        ...formData,
        company: '',
        placementType: '',
        appointmentNo: '',
        appointmentLetter: null,
        package: '',
        designation: '',
        appointmentDate: '',
      });
      setAppointmentFiledata({});
      setAppointmentLetter(null);
      SetAppointmentDate({})
    }

    // Reset form values based on highStudy state
    if (formData.highStudy !== 'Yes') {
      setFormData({
        ...formData,
        highStudyplace: '',
      });
      sethighStudyplace('');
    }

    // Reset form values based on gateStatus state
    if (formData.gateStatus !== 'Yes') {
      setFormData({
        ...formData,
        gateCertificate: '',
      });
      setGateFiledata({});
      setGateCertificate(null)
    }
  };

  return (
    <>
    {loading && <LinearProgress/>}
    <Container style={{ marginBottom: "100px" }}>

      <Container style={{ paddingInline: 0, paddingBottom: 50, marginTop: '15px' }} >
        {!isLock && (
          <Button
            onClick={handleEdit}
            color="primary"
            variant="contained"
            disabled={loading}
            style={{
              position: 'relative',
              float: 'left',
            }}
          >
            <EditIcon />
          </Button>
        )}
        {isEditing && !isLock && (
          <Button
            type="submit"
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            endIcon={<KeyboardArrowRightIcon />}
            disabled={isSubmitting || loading}
            style={{
              position: 'relative',
              float: 'right',
            }}
          >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Submit'}
          </Button>
        )}
        <div style={{
          display: 'flex', gap: '10px', position: 'relative',
          float: 'right',
        }}>
          {!isEditing && appointmentLetter && (
            <Button onClick={() => handleViewCertificate(appointmentLetter)}
              variant="outlined" color="primary">
              View Appointment Letter
            </Button>
          )}
          {!isEditing && (gateStatus === "Yes") && (
            <Button onClick={() => handleViewCertificate(GateCertificate)} variant="outlined" color="primary">
              View Gate Admit Card
            </Button>
          )}
        </div>
      </Container>

      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Have you been placed?"
          variant="outlined"
          fullWidth
          required
          name="isPlaced"
          value={isPlaced}
          onChange={handleIsPlacedChange}
          sx={{ mb: 2 }}
          disabled={!isEditing || isSubmitting}
        >
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>

      </Grid>

      {isPlaced === "true" && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Company"
                variant="outlined"
                fullWidth
                required
                name="company"
                value={formData.company}
                onChange={handleChange}
                error={!!errors.company}
                helperText={errors.company}
                sx={{ mb: 2 }}
                disabled={!isEditing || isSubmitting}
              />
              <TextField
                label="Designation"
                variant="outlined"
                fullWidth
                required
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                error={!!errors.designation}
                helperText={errors.designation}
                sx={{ mb: 2 }}
                disabled={!isEditing || isSubmitting}
              />
            </Grid>
            <Grid item xs={12} md={6}>

              <TextField
                label="Appointment Number"
                variant="outlined"
                fullWidth
                required
                name="appointmentNo"
                type="text"
                value={formData.appointmentNo}
                onChange={handleChange}
                error={!!errors.appointmentNo}
                helperText={errors.appointmentNo}
                sx={{ mb: 2 }}
                disabled={!isEditing || isSubmitting}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs} >
                <DatePicker

                  label="Appointment Date"
                  views={['year', 'month', 'day']}
                  renderInput={(params) => <TextField {...params} helperText="Enter starting year only" />}
                  onChange={handleDateChange}
                  value={AppointmentDate}
                  disabled={!isEditing || isSubmitting}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6} marginTop={2}>
            <TextField
              select
              label="Placement Type"
              placeholder='Select any one'
              variant="outlined"
              fullWidth
              required
              name="placementType"
              value={formData.placementType}
              onChange={handleChange}
              sx={{ mb: 2 }}
              disabled={!isEditing || isSubmitting}
            >
              <MenuItem value="On Campus">On Campus</MenuItem>
              <MenuItem value="Off Campus">Off Campus</MenuItem>
            </TextField>

            <TextField
              label="Package"
              placeholder='in LPA'
              variant="outlined"
              fullWidth
              required
              name="package"
              style={{ marginTop: '10px' }}
              value={formData.package}
              onChange={handleChange}
              error={!!errors.package}
              helperText={errors.package}
              sx={{ mb: 2 }}
              disabled={!isEditing || isSubmitting}
            />

          </Grid>

          {isEditing && (
            <Grid item xs={12} md={6} marginBottom={2} container justifyContent="space-between" alignItems="center">

              <Typography variant="h6" gutterBottom textAlign="left" >
                  Upload Appointment Letter <br />
                  <Typography style={{ fontSize: '14px' }}>(in PDF format only / size less than 500Kb)</Typography>
              </Typography>
              <FileBase
                type="file"
                multiple={false}

                onDone={handleAppointmentFileChange}

                disabled={!isEditing || isSubmitting}
              />

            </Grid>)}

        </>
      )}
      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Will you pursue higher studies?"
          placeholder='Select any one'
          variant="outlined"
          fullWidth
          required
          name="highStudy"
          value={isHighstudy}
          onChange={handleIsHighChange}
          sx={{ mb: 2 }}
          disabled={!isEditing || isSubmitting}
        >
          <MenuItem value={""}>None</MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      </Grid>
      {isHighstudy === "Yes" && (
        <Grid item xs={12} md={6}>
          <TextField
            select
            label="Where do you want to pursue higher Studies?"
            variant="outlined"
            fullWidth
            required
            name="highStudyplace"
            value={highStudyplace}
            onChange={handlehighStudyplace}
            sx={{ mb: 2 }}
            disabled={!isEditing || isSubmitting}
          >
            <MenuItem value={""}>None</MenuItem>
            <MenuItem value="India">India</MenuItem>
            <MenuItem value="Outside">Abroad</MenuItem>
          </TextField>
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Have you appeared in Gate Exam?"
          variant="outlined"
          placeholder='Select any one'
          fullWidth
          required
          name="gateStatus"
          value={gateStatus}
          onChange={handleIsGateStatusChange}
          sx={{ mb: 2 }}
          disabled={!isEditing || isSubmitting}
        >
          <MenuItem value={""}>None</MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      </Grid>
      {isEditing && (gateStatus === "Yes") && (
        <Grid item xs={12} container justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom textAlign="left" marginTop={2}>
            Upload Gate Admit Card / Scorecard
              <br />
              <Typography style={{ fontSize: '14px' }}>(in PDF format only / size less than 500Kb)</Typography>
          </Typography>
          <FileBase
            type="file"
            multiple={false}
            onDone={handleGateFileChange}
            disabled={!isEditing || isSubmitting}
          />
        </Grid>

      )}

      <ToastContainer />
    </Container>
    </>
  );
}
