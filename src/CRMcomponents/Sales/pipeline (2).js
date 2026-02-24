import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useLocation } from "react-router-dom";
import "./pipeline.css";
import ActivitySchedulerPopup from "./ActivityPopup";
import CreatableSelect from "react-select/creatable";
import SalespersonSearch from "./SalespersonSearch";
import SorceSearch from "./SourceSearch";
import MediumSearch from "./MediumSearch";
import { toast } from "react-toastify";
import CampaignSearch from "./CampaignSearch";
import CreateSourceModal from "./addSource";
import AddSalesperson from "./addSalesperson";
import CreateMediumModal from "./addMedium";
import CreateCampaignModal from "./addCampaign";
import SalesTeams from "./SalesTeams.js";
import Tags from "./Tags.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from 'react-toastify';
import Select from "react-select";
const config = require("../../Apiconfig");

const styles = {
  dateGroup: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: 'none',
  },
  dateHeader: {
    fontWeight: '500',
    marginTop: '5px',
    marginBottom: '5px',
    color: '#1a1a1a',
    fontSize: '1.1rem',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '10px',
  },
  logItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
  },
  avatarBase: {
    color: 'white',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    marginRight: '15px',
    fontSize: '1rem',
    flexShrink: 0,
    transition: 'background-color 0.3s',
  },
  logDetails: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#4a4a4a',
    lineHeight: '1.5',
    padding: '0',
  },
  typeColors: {
    stage: {
      color: '#0056b3',
      bg: '#007bff',
    },
    note: {
      color: '#1e7e34',
      bg: '#28a745',
    },
    send: {
      color: '#c66c00',
      bg: '#ff9800',
    },
    activity: {
      color: '#4e2a84',
      bg: '#6f42c1',
    },
  },
  noData: {
    fontSize: "15px",
    color: '#999',
    padding: '15px',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  actionMenuContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '0.9rem',
    marginTop: '5px',
    color: '#6c757d',
  },
  actionButton: {
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  markDone: {
    color: '#28a745',
  },
  edit: {
    color: '#17a2b8',
  },
  cancel: {
    color: '#dc3545',
  },
  actionButtonBase: {
    fontWeight: '500',
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '0.9rem',
    minWidth: '100px',
    whiteSpace: 'nowrap',
  },
  buttonGroup: {
    display: "flex",
    // backgroundColor: '#7a5a82',
    // borderRadius: '4px',
    overflow: 'hidden',
    // boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '35px',
    gap: "20px"
  },
  stageButtonBase: {
    padding: "8px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    transition: "all 0.1s ease",
    lineHeight: "1.5",
    textDecoration: 'none',
    outline: 'none',
    margin: "0",
    borderRadius: "0",
    boxShadow: '0'
  },
  wonButton: {
    backgroundColor: '#7a5a82',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  lostButton: {
    backgroundColor: '#f8f8f8',
    color: '#495057',
    boxShadow: 'inset 1px 0 0 rgba(0, 0, 0, 0.1)',
  },
  wonRibbonContainer: {
    position: 'absolute',
    top: '0px',
    right: '0px',
    zIndex: 10,
    width: '120px',
    height: '120px',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  wonRibbon: {
    position: 'absolute',
    top: '20px',
    right: '-45px',
    width: '180px',
    padding: '6px 0',
    backgroundColor: '#28a745',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    transform: 'rotate(45deg)',
    textAlign: 'center',
  },
  wonRibbonText: {
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
};

function Grid({ }) {
  const [activeStage, setActiveStage] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [title, setTitle] = useState("");
  const [LogNote, setLognote] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("notes");
  const stages = ["New", "Qualified", "Proposal", "Won"];
  const [showSpModal, setShowSpModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [addSourceModal, setAddSourceModal] = useState(false);
  const [addSPModal, setAddSPModal] = useState(false);
  const [ShowMediumModal, setShowMediumModal] = useState(false);
  const [ShowCampaignModal, setShowCampaignModal] = useState(false);
  const [pendingSource, setPendingSource] = useState(null);
  const [pendingSP, setPendingSP] = useState(null);
  const [addMediumModal, setAddMediumModal] = useState(false);
  const [pendingMedium, setPendingMedium] = useState(null);
  const [pendingCampaign, setPendingCampaign] = useState(null);
  const [addCampaignModal, setAddCampaignModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [contactId, setContactId] = useState(0);
  const [opportunityId, setOpportunityId] = useState(0);
  const [opportunityName, setOpportunityName] = useState('');
  const [expectedRevenue, setExpectedRevenue] = useState('');
  const [probability, setProbability] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [property1, setProperty1] = useState('');
  const [expectedClosing, setExpectedClosing] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [rating, setRating] = useState(0);
  const [Source_ID, setSource_ID] = useState('');
  const [Sales_ID, setSales_ID] = useState('');
  const [Medium_ID, setMedium_ID] = useState('');
  const [SalesCode, setSalesCode] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [mediumoptions, setmediumoptions] = useState([]);
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [TagName, setTagName] = useState(null);
  const [TagsOptions, setTagsOptions] = useState([]);
  const [ShowTagsModal, setShowTagsModal] = useState(false);
  const [addTagModal, setAddTagModal] = useState(false);
  const [pendingTags, setPendingTags] = useState(null);

  const [showPopup4, setShowPopup4] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeTab3, setActiveTab3] = useState(null);

  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [website, setWebsite] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [notes, setNotes] = useState('');
  const [logData, setLogData] = useState([]);
  const [salespersonDrop, setSalespersonDrop] = useState([]);
  const [selectedSalesTeam, setSelectedSalesTeam] = useState('');

  const location = useLocation();
  const { data } = location.state || {};

  const opportunity = Array.isArray(data) ? data[0] : data;

  const companyCode = sessionStorage.getItem("selectedCompanyCode");

    useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/GetTeam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setSalespersonDrop(val))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  
  useEffect(() => {
    if (opportunity) {
      setContactId(opportunity.Contact_ID || 0);
      setOpportunityId(opportunity.Opportunity_ID || 0);
      setOpportunityName(opportunity.OpportunityName || '');
      setExpectedRevenue(opportunity.ExpectedRevenue || '');
      setProbability(opportunity.probability || '');
      // setContact(opportunity.Contact || '');
      setSalesCode(opportunity.Sales_man_code || '');
      setEmail(opportunity.Email_ID || '');
      setPhone(opportunity.ContactPhone || '');
      setProperty1(opportunity.property1 || '');
      setExpectedClosing(opportunity.ExpectedClosing || '');
      setTagName(opportunity.tags || '');
      setSourceType(opportunity.sourceType || '');
      setContactName(opportunity.Contact || '');
      setCompanyName(opportunity.Followup_CompanyName || opportunity.Company || '');
      setAddress1(opportunity.Followup_CompanyAddress1 || '');
      setAddress2(opportunity.Followup_CompanyAddress2 || '');
      setState(opportunity.Followup_State || '');
      setCountry(opportunity.Followup_Country || '');
      setPinCode(opportunity.Followup_Pincode || '');
      setCity(opportunity.Followup_City || '');
      setWebsite(opportunity.Website || '');
      setJobPosition(opportunity.Followups_jobposition || '');
      setMedium_ID(opportunity.Medium_ID || '');
      setSource_ID(opportunity.Source_ID || '');
      setCampaignId(opportunity.campaignID || '');
      setReferredBy(opportunity.Referred_BY || '');
      setPaymentType(opportunity.PaymentType || '');
      setNotes(opportunity.Notes || '');
      setExpectedClosing(opportunity.ExpectedClosing ? opportunity.ExpectedClosing.split('T')[0] : '');

      let initialRating = 0;
      if (opportunity.Priority === "Low") initialRating = 1;
      else if (opportunity.Priority === "Medium") initialRating = 2;
      else if (opportunity.Priority === "High") initialRating = 3;
      setRating(initialRating);

      setActiveStage(opportunity.Stage || '');

      const salesTeamCode = opportunity.SalesTeam_Code || '';
      setSales_ID(salesTeamCode);

      if (salespersonDrop.length > 0 && salesTeamCode) {
        const selectedTeam = salespersonDrop.find((team) => String(team.Sales_ID) === String(salesTeamCode));
        if (selectedTeam) {
          console.log("Hello")
          setSelectedSalesTeam({
            value: selectedTeam.Sales_ID,
            label: selectedTeam.Sales_Team,
          });
        }
      }
    }
  }, [opportunity, salespersonDrop]);


  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        const [logRes, actRes] = await Promise.all([
          fetch(`${config.apiBaseUrl}/CRM_LogNoteGet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_code: companyCode,
              Opportunity_ID: opportunityId,
            }),
          }),
          fetch(`${config.apiBaseUrl}/GetActivityAll`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_code: companyCode,
              Opportunity_ID: opportunityId,
            }),
          }),
        ]);

        if (!logRes.ok || !actRes.ok)
          throw new Error("One or more API calls failed");

        const [logResult, actResult] = await Promise.all([
          logRes.json(),
          actRes.json(),
        ]);

        // Format Log Notes
        const formattedLogs = (logResult || []).map((l) => ({
          type: l.type,
          stage: l.stage,
          LogNote: l.LogNote,
          AssignedTo: l.AssignedTo,
          Created_by: l.Created_by || "Unknown",
          Created_Date: l.Created_Date,
        }));

        // Format Activities
        const formattedActs = (actResult || []).map((a) => ({
          type: "activity",
          Type_of_Activity: a.Type_of_Activity,
          Assigned_To: a.Assigned_To,
          Notes: a.Notes,
          Summary: a.Summary,
          Id: a.Activity_ID,
          Created_by: a.Created_by || "Unknown",
          Created_Date: a.created_date,
        }));

        // Merge & Sort
        const allData = [...formattedLogs, ...formattedActs].sort(
          (a, b) =>
            new Date(b.Created_Date || 0) - new Date(a.Created_Date || 0)
        );

        setLogData(allData);
      } catch (err) {
        console.error("Error fetching CRM logs:", err);
        setLogData([]);
      }
    };

    if (companyCode && opportunityId) fetchAllLogs();
  }, [companyCode, opportunityId, refresh]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getCustomerDropdown`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }

        const data = await response.json();

        const formattedOptions = data.map((option) => ({
          value: option.ID,
          label: option.SecondColumn
            ? `${option.FirstColumn} - ${option.SecondColumn}`
            : `${option.FirstColumn}`,
          FirstColumn: option.FirstColumn,
          sourceType: option.sourceType
        }));

        setCustomerOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchCustomers();
  }, []);

  const filteredOptionSalesperson = salespersonDrop.map((option) => ({
    value: option.Sales_ID,
    label: option.Sales_Team,
  }));

  const handleChangeSalesTeam = (selectedOption) => {
    if (selectedOption?.value === "search_more") {
      setShowSalesModal(true);
      return;
    }

    setSelectedSalesTeam(selectedOption);
    setSales_ID(selectedOption ? selectedOption.value : "");
  };


  const fetchSalesperson = async (selectValueAfterFetch) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/salesPersonDropdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();

      const formattedOptions = data.map((option) => ({
        value: option.SalesCode,
        label: option.SalesPersonName
      }));

      setSalespersonOptions(formattedOptions);

      if (selectValueAfterFetch) {
        const matched = formattedOptions.find(
          (opt) => opt.label.toLowerCase() === selectValueAfterFetch.toLowerCase()
        );
        if (matched) setSalesCode(matched.value);
      }

    } catch (error) {
      console.error("Error fetching salesperson:", error);
    }
  };

  useEffect(() => {
    fetchSalesperson();
  }, []);

  const fetchTagName = async (selectValueAfterFetch) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getTagName`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      const formattedOptions = data.map((option) => ({
        value: option.Tag_Name,
        label: option.Tag_Name,
      }));
      setTagsOptions(formattedOptions);
      if (selectValueAfterFetch) {
        const matched = formattedOptions.find(
          (opt) => opt.Tag_Name.toLowerCase() === selectValueAfterFetch.toLowerCase()
        );
        if (matched) setTagName(matched.value);
      }
    } catch (error) {
      console.error("Error fetching tag names:", error);
      // toast.error("Error fetching tag names");
    }
  };

  useEffect(() => {
    fetchTagName();
  }, []);


  const fetchSource = async (selectValueAfterFetch) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch sources");

      const data = await response.json();
      const formattedOptions = data.map((option) => ({
        value: option.Source_ID,
        label: option.SourceName,
      }));

      setSourceOptions(formattedOptions);

      if (selectValueAfterFetch) {
        const matched = formattedOptions.find(
          (opt) => opt.label.toLowerCase() === selectValueAfterFetch.toLowerCase()
        );
        if (matched) setSource_ID(matched.value);
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  useEffect(() => {
    fetchSource();
  }, []);

  const fetchMedium = async (selectValueAfterFetch) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getMedium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();

      const formattedOptions = data.map((option) => ({
        value: option.Medium_ID,
        label: option.MediumName
      }));

      setmediumoptions(formattedOptions);

      if (selectValueAfterFetch) {
        const matched = formattedOptions.find(
          (opt) => opt.label.toLowerCase() === selectValueAfterFetch.toLowerCase()
        );
        if (matched) setMedium_ID(matched.value);
      }

    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchMedium();
  }, []);

  const fetchCampaign = async (selectValueAfterFetch) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getCampaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();

      const formattedOptions = data.map((option) => ({
        value: option.CampaignID,
        label: `${option.CampaignName}`,
        CampaignName: option.CampaignName
      }));

      setCampaignOptions(formattedOptions);

      if (selectValueAfterFetch) {
        const matched = formattedOptions.find(
          (opt) => opt.CampaignName.toLowerCase() === selectValueAfterFetch.toLowerCase()
        );
        if (matched) setCampaignId(matched.value);
      }

    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  const handleSchedule = (newActivity) => {
    setActivities([...activities, newActivity]);
  };

  const toggleTab = (tab) => {
    setActiveTab3(tab);
  };

  const handleStarClick = (value) => {
    if (rating === value) {
      setRating(0);
    } else {
      setRating(value);
    }
  };

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/crmlistpage");
  };

  const handleNavigate1 = () => {
    navigate("/CrmChart");
  };

  const handleNavigate3 = () => {
    navigate("/CrmScheduler");
  };

  const handleNavigate4 = () => {
    navigate("/CrmActivity");
  };

  const handleNavigate5 = () => {
    navigate("/CrmLocation");
  };

  const handleNavigateKanban = () => {
    navigate("/Crmworkspace");
  };

  const handleStageUpdate = async (newStage) => {
    setActiveStage(newStage);
    await handleSave("stage", newStage);
    try {
      const response = await fetch(`${config.apiBaseUrl}/updateNewCompanyStage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Opportunity_ID: opportunityId,
          Stage: newStage,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setActiveStage(newStage);
      } else {
        console.error("Failed to update stage:", result.message);
      }
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };

  const fetchContactsDetails = async (id, type) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getContactsDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Contact_ID: id,
          sourceType: type,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const [{ Email, Phone, CompanyName, Address1, Address2, Address3, City, Country, Name, State, Website, Zip }] = data

        setContactName(Name);
        setCompanyName(CompanyName);
        setAddress1(Address1);
        setAddress2(Address2);
        setAddress3(Address3);
        setState(State);
        setCountry(Country);
        setPinCode(Zip);
        setWebsite(Website);
        setCity(City);
        setEmail(Email);
        setPhone(Phone);

      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert Purchase data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };


  const handleSave = async (type, newStage = null) => {
    try {
      let data = {
        Opportunity_ID: opportunityId,
        Created_by: sessionStorage.getItem("selectedUserCode"),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        type: type,
      };

      if (type === "send") {
        data = {
          ...data,
          AssignedTo: title,
          LogNote: message,
        };
      } else if (type === "note") {
        data = {
          ...data,
          LogNote: LogNote,
          // stage: activeStage,
        };
      } else if (type === "stage") {
        data = {
          ...data,
          stage: newStage,
        };
      }

      const response = await fetch(`${config.apiBaseUrl}/CRM_LogNoteInsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully`);
        setTitle("");
        setMessage("");
        setLognote("");
        setRefresh((prev) => !prev);
      } else {
        toast.warning(result.message);
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    }
  };

  const sortByType = (arr) => {
    const order = ["stage", "note", "send", "activity"];
    return arr.sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
    );
  };

  const handleActivityClick = () => {
    toggleTab("activity");
    navigate("/CrmActivity", { state: { opportunityId: Number(opportunityId) } });
  };


  // const groupedData = groupByDate(logData);

  const groupedData = logData.reduce((acc, item) => {
    const dateVal = item.Created_Date ? new Date(item.Created_Date) : null;
    const dateKey = dateVal && !isNaN(dateVal)
      ? dateVal.toISOString().split("T")[0]
      : "Unknown Date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});


  const handleSubmit = async () => {
    let priorityText = "";
    if (rating <= 1) priorityText = "Low";
    else if (rating === 2) priorityText = "Medium";
    else if (rating === 3) priorityText = "High";

    const newCompanyData = {
      Opportunity_ID: opportunityId,
      OpportunityName: opportunityName,
      Contact_ID: contactId,
      ContactPhone: phone,
      ExpectedRevenue: expectedRevenue,
      Payment: expectedRevenue,
      ExpectedClosing: expectedClosing,
      Email_ID: email,
      Priority: priorityText,
      Contact_Followups: contactName,
      Followups_jobposition: jobPosition,
      Sales_man_code: SalesCode,
      campaignID: campaignId,
      Medium_ID: Medium_ID,
      Source_ID: Source_ID,
      Referred_BY: referredBy,
      SalesTeam_Code: Sales_ID.toString(),
      Followup_CompanyName: companyName,
      Followup_CompanyAddress1: address1,
      Followup_CompanyAddress2: address2,
      Followup_City: city,
      Followup_State: state,
      Followup_Country: country,
      Followup_Pincode: pinCode,
      Stage: activeStage,
      Website: website,
      sourceType: sourceType,
      PaymentType: paymentType,
      Notes: notes,
      company_code: sessionStorage.getItem("selectedCompanyCode"),
      modified_by: sessionStorage.getItem("selectedUserCode")
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/CRM_NewCompanyUpdate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompanyData),
      });

      if (response.ok) {

        toast.success(`Data inserted successfully`);

      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert Purchase data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const handleActivityDelete = async (activityId) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CRM_ActivityDelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Activity_ID: activityId.toString(),
          Company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Data deleted successfully");
        setRefresh((prev) => !prev);
      } else {
        console.error("Failed to update stage:", result.message);
      }
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-0 mb-2 bg-white rounded">
        <div className="d-flex justify-content-between flex-wrap p-1">
          <div className="d-flex justify-content-start">
            <h1 className="">CRM Workspace</h1>
          </div>
          <div className="d-flex justify-content-end">
            <addbutton className="mt-2 " onClick={handleNavigateKanban}>
              <i class="bi bi-kanban text-dark fs-4"></i>
            </addbutton>
            <addbutton className="mt-2 " onClick={handleNavigate}>
              <i class="bi bi-card-list text-dark fs-4"></i>
            </addbutton>
            <addbutton className="mt-2 " onClick={handleNavigate3}>
              <i class="bi bi-calendar3 text-dark fs-4"></i>
            </addbutton>
            <addbutton className="mt-2 " onClick={handleNavigate1}>
              <i class="bi bi-bar-chart-fill text-dark fs-4"></i>
            </addbutton>
            <addbutton className="mt-2 " onClick={handleNavigate4}>
              <i class="bi bi-stopwatch text-dark fs-4"></i>
            </addbutton>
            <addbutton className="mt-2 " onClick={handleNavigate5}>
              <i class="bi bi-geo-alt-fill text-dark fs-4"></i>
            </addbutton>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2 shadow-lg bg-white rounded-3 p-3">
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.stageButtonBase, ...styles.wonButton }}
            onClick={() => handleStageUpdate("Won")}
          >
            Won
          </button>

          <button
            style={{ ...styles.stageButtonBase, ...styles.lostButton }}
          // onClick={() => handleStageUpdate("Lost")}
          >
            Lost
          </button>
        </div>

        {/* Stage Pipeline */}
        <ul className="nav nav-pills" style={{ gap: "10px" }}>
          {stages.map((stage, index) => (
            <li className="nav-item" key={index}>
              <button
                className="nav-link"
                style={{
                  backgroundColor:
                    activeStage.toLowerCase() === stage.toLowerCase()
                      ? "#4CAF50"
                      : "#f1f1f1",
                  color:
                    activeStage.toLowerCase() === stage.toLowerCase()
                      ? "#fff"
                      : "#555",
                  borderRadius: "20px",
                  padding: "6px 18px",
                  fontWeight:
                    activeStage.toLowerCase() === stage.toLowerCase()
                      ? "600"
                      : "400",
                  border: "1px solid #ddd",
                  boxShadow:
                    activeStage.toLowerCase() === stage.toLowerCase()
                      ? "0 2px 6px rgba(0,0,0,0.2)"
                      : "none",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleStageUpdate(stage)}
              >
                {stage}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Left Panel */}
        <div className="col-md-8" style={{ maxHeight: 'calc(85vh - 100px)', overflowY: 'auto' }}>
          <div className="card">
            {activeStage.toLowerCase() === 'won' && (
              <div style={styles.wonRibbonContainer}>
                <div style={styles.wonRibbon}>
                  <span style={styles.wonRibbonText}>WON</span>
                </div>
              </div>
            )}
            <div className="card-body p-0">
              <div style={{ maxWidth: '800px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                  }}
                >
                  <input
                    type="text"
                    value={opportunityName}
                    onChange={(e) => setOpportunityName(e.target.value)}
                    className="custom-input"
                    style={{
                      width: "700px", fontSize: "28px"
                    }}
                  />

                  <button
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
                  >
                    <FontAwesomeIcon icon={faSave} size="lg" />
                  </button>
                </div>

                <div style={{ display: 'flex', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#555', fontWeight: '600', }}>
                      Expected Revenue
                    </div>
                    ₹
                    <input
                      type="text"
                      value={expectedRevenue}
                      onChange={(e) => setExpectedRevenue(e.target.value)}
                      className="custom-input"
                    />
                  </div>
                  {/* Probability */}
                  <div>
                    <div style={{ fontSize: '14px', color: '#555', fontWeight: '600', }}>
                      Probability
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ color: '#6c757d', fontSize: '16px', marginRight: '4px' }}>at</span>
                      <input
                        type="text"
                        value={probability}
                        onChange={(e) => setProbability(e.target.value)}
                        className="custom-input"
                      />
                      <span style={{ fontSize: '16px', color: '#333', marginLeft: '4px' }}>%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-start" style={{ display: 'flex', gap: '40px' }}>
                  {/* Left Column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Contact
                      </label>
                      <CreatableSelect
                        className="custom-input"
                        isClearable
                        style={{ outline: "none" }}
                        options={customerOptions}
                        value={
                          customerOptions.find(
                            (opt) =>
                              opt.value === contactId &&
                              opt.sourceType === sourceType
                          ) || (contactId ? { value: contactId, label: contactId } : null)
                        }
                        onChange={(newValue) => {
                          if (newValue) {
                            // setContact(newValue.FirstColumn);
                            setContactId(newValue.value);
                            setSourceType(newValue.sourceType);
                            fetchContactsDetails(newValue.value, newValue.sourceType);
                          } else {
                            // setContact(null);
                            setContactId(null);
                            setSourceType(null);
                          }
                        }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            backgroundColor: "transparent",
                          }),
                          indicatorSeparator: () => ({ display: "none" }),
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="custom-input"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="custom-input"
                      />
                    </div>

                    {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Property 1
                      </label>
                      <input
                        type="text"
                        value={property1}
                        onChange={(e) => setProperty1(e.target.value)}
                        className="custom-input"
                      />
                    </div> */}
                  </div>

                  {/* Right Column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Sales person
                      </label>
                      <CreatableSelect
                        className="custom-input"
                        isClearable
                        style={{ outline: "none" }}
                        options={[...salespersonOptions, { value: "search_more", label: "Search more..." }]}
                        value={
                          salespersonOptions.find((opt) => opt.value === SalesCode) ||
                          (SalesCode ? { value: SalesCode, label: SalesCode } : null)
                        }
                        getOptionLabel={(option) =>
                          option.value === "search_more"
                            ? <span style={{ color: "blue", cursor: "pointer" }}>{option.label}</span>
                            : option.label
                        }
                        onChange={(newValue) => {
                          if (newValue) {
                            if (newValue.value === "search_more") {
                              setShowSpModal(true);
                            } else {
                              setSalesCode(newValue.value);
                            }
                          } else {
                            setSalesCode(null);
                          }
                        }}
                        onCreateOption={(inputValue) => {
                          setPendingSP(inputValue);
                          setAddSPModal(true);
                        }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            backgroundColor: "transparent",
                          }),
                          indicatorSeparator: () => ({ display: "none" }),
                        }}
                      />
                      <SalespersonSearch
                        showSpSearch={showSpModal}
                        onSpSearchClose={() => setShowSpModal(false)}
                        onSaveSP={(selectedsetSalesCode) => {
                          setSalesCode(selectedsetSalesCode);
                          setShowSpModal(false);
                        }}
                      />
                      <AddSalesperson
                        showSalesperson={addSPModal}
                        onSalespersonClose={() => setAddSPModal(false)}
                        typedValue={pendingSP}
                        onSuccess={(newValue) => {
                          fetchSalesperson(newValue);
                          setPendingSP(null);
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Expected Closing
                      </label>
                      <input
                        type="date"
                        value={expectedClosing}
                        onChange={(e) => setExpectedClosing(e.target.value)}
                        className="custom-input"
                      />
                      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: '10px', marginLeft: '20px' }}>
                        <div style={{ color: '#ccc', fontSize: '16px' }}>
                          {[1, 2, 3].map((star) => (
                            <i
                              key={star}
                              className={`bi bi-star${star <= rating ? "-fill text-warning" : " text-secondary"}`}
                              onClick={() => handleStarClick(star)}
                              style={{
                                fontSize: "25px",
                                cursor: "pointer",
                                marginRight: "5px",
                                transition: "color 0.2s ease-in-out",
                              }}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#555', flexBasis: '150px' }}>
                        Tags
                      </label>

                      <CreatableSelect
                        className="custom-input"
                        isClearable
                        style={{ outline: "none" }}
                        options={[...TagsOptions, { value: "search_more", label: "Search more..." }]}
                        value={
                          TagsOptions.find((opt) => opt.value === TagName) ||
                          (TagName ? { value: TagName, label: TagName } : null)
                        }
                        getOptionLabel={(option) =>
                          option.value === "search_more" ? (
                            <span style={{ color: "blue", cursor: "pointer" }}>
                              {option.label}
                            </span>
                          ) : (
                            option.label
                          )
                        }
                        onChange={(newValue) => {
                          if (newValue) {
                            if (newValue.value === "search_more") {
                              setShowTagsModal(true);
                            } else {
                              setTagName(newValue.value);
                            }
                          } else {
                            setTagName(null);
                          }
                        }}
                        onCreateOption={(inputValue) => {
                          setPendingTags(inputValue);
                          setAddTagModal(true);
                        }}
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "none",
                            boxShadow: "none",
                            backgroundColor: "transparent",
                          }),
                          indicatorSeparator: () => ({ display: "none" }),
                        }}
                      />
                      <Tags
                        showTagSearch={ShowTagsModal}
                        onTagSearchClose={() => setShowTagsModal(false)}
                        onSaveTagName={(selectedTag) => {
                          setTagName(selectedTag);
                          setShowTagsModal(false);
                        }}
                      />
                      <addTagModal
                        showTag={addTagModal}
                        onCloseTag={() => setAddTagModal(false)}
                        typedValue={pendingTags}
                        onSuccess={(newValue) => {
                          fetchTagName(newValue);
                          setPendingTags(null);
                        }}
                      />


                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", borderBottom: "1px solid #eeeeeeff" }}>
                <button
                  onClick={() => setActiveTab("notes")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "8px 16px",
                    marginRight: "0px",
                    fontSize: "14px",
                    borderRadius: "0",
                    cursor: "pointer",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    color: activeTab === "notes" ? "#000" : "#444",
                    fontWeight: activeTab === "notes" ? "700" : "500",
                    borderTop: activeTab === "notes" ? "2px solid #5c2c6d" : "2px solid transparent",
                    borderBottom: activeTab === "notes" ? "2px solid #ffffffff" : "2px solid transparent",
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  Notes
                </button>
                <button
                  onClick={() => {
                    setActiveTab("contacts");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "8px 16px",
                    marginRight: "0px",
                    fontSize: "14px",
                    borderRadius: "0",
                    cursor: "pointer",
                    color: activeTab === "contacts" ? "#000" : "#444",
                    fontWeight: activeTab === "contacts" ? "700" : "500",
                    borderTop: activeTab === "contacts" ? "2px solid #5c2c6d" : "0px solid transparent",
                    borderBottom: activeTab === "contacts" ? "2px solid #ffffffff" : "2px solid transparent",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  Contacts
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-3">
                {activeTab === "notes" && (
                  <div>
                    <h6 className="fw-bold">Notes</h6>
                    <textarea
                      placeholder="Add your notes here..."
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        padding: "10px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}

                {activeTab === "contacts" && (
                  <div className="row">
                    {/* Company Information */}
                    <div className="col-md-6">
                      <h6 className="fw-bold mt-3 d-flex justify-content-start">Company Information</h6>
                      <div style={{ marginBottom: "10px" }}>
                        <label className=" d-flex justify-content-start" style={{ fontWeight: "600", fontSize: "14px", color: "#555" }}>Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          style={{
                            display: "block",
                            width: "100%",
                            border: "none",
                            borderBottom: "2px solid #ccc",
                            outline: "none",
                            padding: "6px 2px",
                            marginTop: "4px",
                            fontSize: "14px",
                            transition: "border-color 0.2s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                          onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                        />
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <label className=" d-flex justify-content-start" style={{ fontWeight: "600", fontSize: "14px", color: "#555" }}>Address</label>
                        <div className=" mt-3">
                          {/* Address */}
                          <div className="mb-3">
                            <input
                              type="text"
                              value={address1}
                              onChange={(e) => setAddress1(e.target.value)}
                              style={{
                                display: "block",
                                width: "100%",
                                border: "none",
                                borderBottom: "2px solid #ccc",
                                outline: "none",
                                padding: "6px 2px",
                                marginTop: "4px",
                                fontSize: "14px",
                                transition: "border-color 0.2s ease",
                              }}
                              onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                              onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                              placeholder="Street (or) Other"
                            />
                          </div>

                          {/* Pincode */}

                          {/* State, District, Country - same line */}
                          <div className="row mb-3">
                            <div className="col">
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  border: "none",
                                  borderBottom: "2px solid #ccc",
                                  outline: "none",
                                  padding: "6px 2px",
                                  marginTop: "4px",
                                  fontSize: "14px",
                                  transition: "border-color 0.2s ease",
                                }}
                                onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                                onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                                placeholder="City"
                              />
                            </div>
                            <div className="col">
                              <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  border: "none",
                                  borderBottom: "2px solid #ccc",
                                  outline: "none",
                                  padding: "6px 2px",
                                  marginTop: "4px",
                                  fontSize: "14px",
                                  transition: "border-color 0.2s ease",
                                }}
                                onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                                onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                                placeholder="State"
                              />
                            </div>
                            <div className="col">
                              <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  border: "none",
                                  borderBottom: "2px solid #ccc",
                                  outline: "none",
                                  padding: "6px 2px",
                                  marginTop: "4px",
                                  fontSize: "14px",
                                  transition: "border-color 0.2s ease",
                                }}
                                onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                                onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                                placeholder="Country"
                              />
                            </div>
                            <div className="col">
                              <input
                                type="text"
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  border: "none",
                                  borderBottom: "2px solid #ccc",
                                  outline: "none",
                                  padding: "6px 2px",
                                  marginTop: "4px",
                                  fontSize: "14px",
                                  transition: "border-color 0.2s ease",
                                }}
                                onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                                onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                                placeholder="Pin code"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="col-md-6">
                      <h6 className="fw-bold mt-3 d-flex justify-content-start">Contact Information</h6>
                      <div style={{ marginBottom: "10px" }}>
                        <label className=" d-flex justify-content-start" style={{ fontWeight: "600", fontSize: "14px", color: "#555" }}>Contact Name</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          style={{
                            display: "block",
                            width: "100%",
                            border: "none",
                            borderBottom: "2px solid #ccc",
                            outline: "none",
                            padding: "6px 2px",
                            marginTop: "4px",
                            fontSize: "14px",
                            transition: "border-color 0.2s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                          onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                        />
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <label className=" d-flex justify-content-start" style={{ fontWeight: "600", fontSize: "14px", color: "#555" }}>Job Position</label>
                        <input
                          type="text"
                          value={jobPosition}
                          onChange={(e) => setJobPosition(e.target.value)}
                          style={{
                            display: "block",
                            width: "100%",
                            border: "none",
                            borderBottom: "2px solid #ccc",
                            outline: "none",
                            padding: "6px 2px",
                            marginTop: "4px",
                            fontSize: "14px",
                            transition: "border-color 0.2s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                          onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                        />
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <label className=" d-flex justify-content-start" style={{ fontWeight: "600", fontSize: "14px", color: "#555" }}>Website</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          style={{
                            display: "block",
                            width: "100%",
                            border: "none",
                            borderBottom: "2px solid #ccc",
                            outline: "none",
                            padding: "6px 2px",
                            marginTop: "4px",
                            fontSize: "14px",
                            transition: "border-color 0.2s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                          onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                        />
                      </div>
                    </div>

                    {/* Marketing */}
                    <div className="col-md-6">
                      <h6 className=" mt-3 d-flex justify-content-start" style={{ fontWeight: "600" }}>Marketing</h6>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <label style={{ fontSize: "16px", color: "#333", minWidth: "80px" }}>
                          Campaign:
                        </label>
                        <div style={{ position: "relative", flex: 1 }}>
                          <CreatableSelect
                            className="custom-input"
                            isClearable
                            style={{ outline: "none" }}
                            options={[...campaignOptions, { value: "search_more", label: "Search more..." }]}
                            value={
                              campaignOptions.find((opt) => opt.value === campaignId) ||
                              (campaignId ? { value: campaignId, label: campaignId } : null)
                            }
                            getOptionLabel={(option) =>
                              option.value === "search_more" ? (
                                <span style={{ color: "blue", cursor: "pointer" }}>{option.label}</span>
                              ) : (
                                option.label
                              )
                            }
                            onChange={(newValue) => {
                              if (newValue) {
                                if (newValue.value === "search_more") {
                                  setShowCampaignModal(true);
                                } else {
                                  setCampaignId(newValue.value);
                                }
                              } else {
                                setCampaignId(null);
                              }
                            }}
                            onCreateOption={(inputValue) => {
                              setPendingCampaign(inputValue);
                              setAddCampaignModal(true);
                            }}
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "none",
                                boxShadow: "none",
                                backgroundColor: "transparent",
                              }),
                              indicatorSeparator: () => ({ display: "none" }),
                            }}
                          />
                          <CampaignSearch
                            showCampaignSearch={ShowCampaignModal}
                            onCampaignSearchClose={() => setShowCampaignModal(false)}
                            onSaveCampainId={(selectedCampaignId) => {
                              setCampaignId(selectedCampaignId);
                              setShowCampaignModal(false)
                            }}
                          />
                          <CreateCampaignModal
                            showCampaign={addCampaignModal}
                            onCloseCampaign={() => setAddCampaignModal(false)}
                            typedValue={pendingCampaign}
                            onSuccess={(newValue) => {
                              fetchCampaign(newValue);
                              setPendingCampaign(null);
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <label style={{ fontSize: "16px", minWidth: "80px" }}>
                          Medium:
                        </label>
                        <div style={{ position: "relative", flex: 1 }}>
                          <CreatableSelect
                            className="custom-input"
                            style={{ outline: "none" }}
                            isClearable
                            options={[...mediumoptions, { value: "search_more", label: "Search more..." }]}
                            value={
                              mediumoptions.find((opt) => opt.value === Medium_ID) ||
                              (Medium_ID ? { value: Medium_ID, label: Medium_ID } : null)
                            }
                            getOptionLabel={(option) =>
                              option.value === "search_more" ? (
                                <span style={{ color: "blue", cursor: "pointer" }}>{option.label}</span>
                              ) : (
                                option.label
                              )
                            }
                            onChange={(newValue) => {
                              if (newValue) {
                                if (newValue.value === "search_more") {
                                  setShowMediumModal(true);
                                } else {
                                  setMedium_ID(newValue.value);
                                }
                              } else {
                                setMedium_ID(null);
                              }
                            }}
                            onCreateOption={(inputValue) => {
                              setPendingMedium(inputValue);
                              setAddMediumModal(true);
                            }}
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "none",
                                boxShadow: "none",
                                backgroundColor: "transparent",
                              }),
                              indicatorSeparator: () => ({ display: "none" }),
                            }}
                          />
                          <MediumSearch
                            showMediumSearch={ShowMediumModal}
                            onMediumSearchClose={() => setShowMediumModal(false)}
                            onSaveMedium={(selectedMediumId) => {
                              setMedium_ID(selectedMediumId);
                              setShowMediumModal(false)
                            }}
                          />
                          <CreateMediumModal
                            showMedium={addMediumModal}
                            onCloseMedium={() => setAddMediumModal(false)}
                            typedValue={pendingMedium}
                            onSuccess={(newValue) => {
                              fetchMedium(newValue);
                              setPendingMedium(null);
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <label style={{ fontSize: "16px", minWidth: "80px" }}>Source:</label>

                        <div style={{ position: "relative", flex: 1 }}>
                          <CreatableSelect
                            className="custom-input"
                            isClearable
                            style={{ outline: "none" }}
                            options={[...sourceOptions, { value: "search_more", label: "Search more..." }]}
                            value={
                              sourceOptions.find((opt) => opt.value === Source_ID) ||
                              (Source_ID ? { value: Source_ID, label: Source_ID } : null)
                            }
                            getOptionLabel={(option) =>
                              option.value === "search_more" ? (
                                <span style={{ color: "blue", cursor: "pointer" }}>{option.label}</span>
                              ) : (
                                option.label
                              )
                            }
                            onChange={(newValue) => {
                              if (newValue) {
                                if (newValue.value === "search_more") {
                                  setShowSourceModal(true);
                                } else {
                                  setSource_ID(newValue.value);
                                }
                              } else {
                                setSource_ID(null);
                              }
                            }}
                            onCreateOption={(inputValue) => {
                              setPendingSource(inputValue);
                              setAddSourceModal(true);
                            }}
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "none",
                                boxShadow: "none",
                                backgroundColor: "transparent",
                              }),
                              indicatorSeparator: () => ({ display: "none" }),
                            }}
                          />
                          <SorceSearch
                            showSourceSearch={showSourceModal}
                            onSourceSearchClose={() => setShowSourceModal(false)}
                            onSaveSource={(selectedSourceId) => {
                              setSource_ID(selectedSourceId);
                              setShowSourceModal(false)
                            }}
                          />
                          <CreateSourceModal
                            showSource={addSourceModal}
                            onCloseSource={() => setAddSourceModal(false)}
                            typedValue={pendingSource}
                            onSuccess={(newValue) => {
                              fetchSource(newValue);
                              setPendingSource(null);
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <label style={{ fontSize: "16px", color: "#333", minWidth: "80px" }}>
                          Referred By:
                        </label>
                        <input
                          type="text"
                          style={{
                            flex: 1,
                            border: "none",
                            borderBottom: "2px solid #ccc",
                            outline: "none",
                            padding: "6px 2px",
                            fontSize: "14px",
                            transition: "border-color 0.2s ease",
                          }}
                          value={referredBy}
                          onChange={(e) => setReferredBy(e.target.value)}
                          onFocus={(e) => (e.target.style.borderBottom = "2px solid #ffc107")}
                          onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h6 className=" mt-3 d-flex justify-content-start" style={{ fontWeight: "600" }}>Ownership</h6>
                      <h6 className="mt-3 d-flex justify-content-start" style={{ fontWeight: "600", fontSize: "14px", color: "#555" }}>Sales Team</h6>
                      <div style={{ position: "relative", flex: 1 }}>
                        <Select
                          className="custom-input"
                          isClearable
                          style={{ outline: "none" }}
                          options={[...filteredOptionSalesperson, { value: "search_more", label: "Search more..." }]}
                          value={selectedSalesTeam}
                          getOptionLabel={(option) =>
                            option.value === "search_more" ? (
                              <span style={{ color: "blue", cursor: "pointer" }}>{option.label}</span>
                            ) : (
                              option.label
                            )
                          }
                          onChange={handleChangeSalesTeam}
                          styles={{
                            control: (base) => ({
                              ...base,
                              border: "none",
                              boxShadow: "none",
                              backgroundColor: "transparent",
                            }),
                            indicatorSeparator: () => ({ display: "none" }),
                          }}
                        />
                        <SalesTeams
                          showSalesTeamSearch={showSalesModal}
                          onSalesTeamSearchClose={() => setShowSalesModal(false)}
                          onSaveSalesTeam={(selectedSalesTeamId) => {
                            const selectedTeamObj = salespersonDrop.find(
                              (team) => team.Sales_ID === selectedSalesTeamId
                            );

                            if (selectedTeamObj) {
                              setSelectedSalesTeam({
                                value: selectedTeamObj.Sales_ID,
                                label: selectedTeamObj.Sales_Team,
                              });
                            }

                            setSales_ID(selectedSalesTeamId);
                            setShowSalesModal(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right Activity Panel */}
        <div className="col-md-4" style={{ maxHeight: 'calc(85vh - 100px)', overflowY: 'auto' }}>
          <div className="card shadow-sm" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header d-flex gap-2">
              <button
                className={`btn btn-sm ${activeTab3 === "send" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleTab("send")}
              >
                Send message
              </button>

              <button
                className={`btn btn-sm ${activeTab3 === "note" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleTab("note")}
              >
                Log note
              </button>

              <button
                className={`btn btn-sm ${activeTab3 === "activity" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleActivityClick(opportunityId)}
              >
                Activity
              </button>
            </div>

            {activeTab3 === "send" && (
              <div className="p-2 border-top">
                <input
                  type="text"
                  className="form-control mb-2"
                  value={title}
                  placeholder="Assign To"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="form-control mb-2"
                  placeholder="Send a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="2"
                ></textarea>
                <button className="btn btn-primary btn-sm" onClick={() => handleSave("send")}>
                  Send
                </button>
              </div>
            )}

            {activeTab3 === "note" && (
              <div className="p-2 border-top">
                <textarea
                  className="form-control mb-2"
                  placeholder="Log an internal note..."
                  rows="2"
                  value={LogNote}
                  onChange={(e) => setLognote(e.target.value)}
                ></textarea>
                <button className="btn btn-primary btn-sm" onClick={() => handleSave("note")}>
                  Log
                </button>
              </div>
            )}

            <div
              className="card-body p-0"
              style={{
                overflowY: 'auto',
                flexGrow: 1,
                padding: '10px'
              }}
            >
              {logData.length > 0 ? (
                Object.keys(groupedData)
                  .sort((a, b) => new Date(b) - new Date(a))
                  .map((date) => (
                    <div
                      key={date}
                      style={styles.dateGroup}
                    >
                      <div
                        style={styles.dateHeader}
                      >
                        {date === "Unknown Date"
                          ? "Unknown Date"
                          : new Date(date).toDateString()}
                      </div>

                      {sortByType(groupedData[date]).map((item, index) => {

                        const logItemStyle = {
                          ...styles.logItem,
                          borderBottom:
                            index !== groupedData[date].length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        };

                        const avatarColor =
                          item.type === "stage"
                            ? styles.typeColors.stage.bg
                            : item.type === "note"
                              ? styles.typeColors.note.bg
                              : item.type === "send"
                                ? styles.typeColors.send.bg
                                : styles.typeColors.activity.bg;

                        const avatarStyle = {
                          ...styles.avatarBase,
                          backgroundColor: avatarColor,
                        };

                        return (
                          <div
                            key={index}
                            style={logItemStyle}
                          >
                            <div style={avatarStyle}>
                              {item.Created_by
                                ? item.Created_by[0].toUpperCase()
                                : "U"}
                            </div>

                            <div>
                              <p style={styles.logDetails}>
                                <span>{item.Created_by}</span>{" "}

                                {item.type === "stage" && (
                                  <>
                                    → <span>Stage Updated:</span>{" "}
                                    <span style={{ color: styles.typeColors.stage.color }}>
                                      {item.stage?.toUpperCase() || "N/A"}
                                    </span>
                                  </>
                                )}

                                {item.type === "note" && (
                                  <>
                                    → <span>Note Added:</span>{" "}
                                    <span style={{ color: styles.typeColors.note.color }}>
                                      {item.LogNote}
                                    </span>
                                  </>
                                )}

                                {item.type === "send" && (
                                  <>
                                    → <span>Sent To:</span>{" "}
                                    <span style={{ color: styles.typeColors.send.color }}>
                                      {item.AssignedTo || "N/A"}
                                    </span>{" "}
                                    — <span>{item.LogNote}</span>
                                  </>
                                )}

                                {item.type === "activity" && (
                                  <>
                                    → <span>Activity:</span>{" "}
                                    <span style={{ color: styles.typeColors.activity.color }}>
                                      {item.Type_of_Activity} - {item.Summary}
                                    </span>
                                    <br />
                                    <span>Assigned To:</span> {item.Assigned_To || "N/A"} <br />
                                    <span>Notes:</span> {item.Notes || "N/A"}
                                    <div style={styles.actionMenuContainer}>
                                      <span style={{ ...styles.actionButton, ...styles.markDone }} /* onClick={handleMarkDone} */>
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        Mark Done
                                      </span>
                                      <span style={{ ...styles.actionButton, ...styles.edit }} /* onClick={handleEdit} */>
                                        <i className="bi bi-pencil-fill me-1"></i>
                                        Edit
                                      </span>
                                      <span style={{ ...styles.actionButton, ...styles.cancel }} onClick={() => handleActivityDelete(item.Id)}>
                                        <i className="bi bi-x-circle-fill me-1"></i>
                                        Cancel
                                      </span>
                                    </div>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
              ) : (
                <p style={styles.noData}>
                  No log data available
                </p>
              )}
            </div>
          </div>
          {/* Sample Popup for Activity */}
          <ActivitySchedulerPopup
            show={showPopup4}
            onClose={() => setShowPopup4(false)}
            onSchedule={handleSchedule}
          />
        </div>
      </div>
    </div>
  );
}

export default Grid;
