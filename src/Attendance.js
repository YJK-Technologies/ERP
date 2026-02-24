import { useState, useRef, useEffect } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "./Loading";
import Select from "react-select";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { AgGridReact } from "ag-grid-react";
import { showConfirmationToast } from './ToastConfirmation';
import * as XLSX from "xlsx";

const config = require("./Apiconfig");

/* =====================
   BLINK CONSTANTS
===================== */
const EAR_THRESHOLD = 0.2;
const BLINK_CONSEC_FRAMES = 3;
const BLINK_COOLDOWN_MS = 5 * 60 * 1000;

function Attendance({ }) {
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // yyyy-mm-dd
    };

    const [faceVerified, setFaceVerified] = useState(false);
    const [visitorData, setVisitorData] = useState(null);
    const [entryDate, setEntryDate] = useState(getTodayDate());
    const [purpose, setPurpose] = useState("");
    const [selectedPurpose, setSelectedPurpose] = useState([]);
    const [vehicleNo, setVehicleNo] = useState("");
    const [remarks, setRemarks] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const webcamRef = useRef(null);
    const cameraRef = useRef(null);
    const verifyLockRef = useRef(false);
    const blinkCounterRef = useRef(0);
    const [status, setStatus] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [statusDrop, setStatusDrop] = useState([]);
    const [purposeDrop, setPurposeDrop] = useState([]);
    const [rowData, setrowData] = useState([]);
    const [selectedStatusSC, setSelectedStatusSC] = useState('');
    const [selectedPurposesc, setselectedPurposeSC] = useState([]);
    const [Vehicle_NumberSC, setVehicle_NumberSC] = useState("");
    const [Visitor_Name, setVisitor_Name] = useState("");
    const [selectedVisitor_IDsearch, setselectedVisitor_IDsearch] = useState("");
    const [StartDate, setStartDate] = useState("");
    const [Expired_Date, setExpired_Date] = useState("");
    const [EndDate, setEndDate] = useState("");
    const [visitordropSC, setvisitordropSC] = useState([]);
    const [purposedrop, setpurposedrop] = useState([]);
    const [statusdropSC, setStatusdropSC] = useState([]);
    const [Visitor_IDsearch, setVisitor_IDsearch] = useState("");
    const [setpurposesc, setPurposeSC] = useState("");
    const [IdProofTyprDrop, setidProofTypeDrop] = useState([]);
    const [CustomerTypeDrop, setcustomerTypeDrop] = useState([]);
    const [StatusDrop, setstatusDrop] = useState([]);
    const [StatusSC, setstatusSC] = useState("");
    const [filtercode, setFilterCode] = useState('');
    const [Tag_NoSC, setTag_NoSC] = useState("");
    const [Phone_No, setPhone_No] = useState("");
    const [ID_Proof_No, setID_Proof_No] = useState("");
    const [tagNo, setTagNo] = useState("");
    const [visitorImage, setVisitorImage] = useState(null);
    const [PurposeDrop, setpurposeDrop] = useState([]);

    const eyeOpenDetectedRef = useRef(false);
    const blinkCooldownUntilRef = useRef(0);

    const resetForNextVisitor = () => {
        setFaceVerified(false);
        setVisitorData(null);
        verifyLockRef.current = false;
        blinkCounterRef.current = 0;
        eyeOpenDetectedRef.current = false;
        clearInputFields();
    };

    /* =====================
     EAR CALCULATION
  ===================== */
    const calculateEAR = (landmarks) => {
        const indices = [33, 160, 158, 133, 153, 144];
        if (!Array.isArray(landmarks)) return null;

        for (let i of indices) {
            if (!landmarks[i]) return null;
        }

        const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

        const vertical1 = dist(landmarks[160], landmarks[144]);
        const vertical2 = dist(landmarks[158], landmarks[153]);
        const horizontal = dist(landmarks[33], landmarks[133]);

        if (!horizontal) return null;
        return (vertical1 + vertical2) / (2.0 * horizontal);
    };

    const onResults = (results) => {
        if (Date.now() < blinkCooldownUntilRef.current) return;
        if (!results?.multiFaceLandmarks?.length) return;
        if (faceVerified || verifyLockRef.current) return;

        const landmarks = results.multiFaceLandmarks[0];
        const ear = calculateEAR(landmarks);
        if (ear === null) return;

        /* ===============================
           STEP 1: WAIT FOR EYES OPEN
        =============================== */
        if (!eyeOpenDetectedRef.current) {
            if (ear > EAR_THRESHOLD) {
                eyeOpenDetectedRef.current = true;
                blinkCounterRef.current = 0;
            }
            return; // ❌ DO NOT detect blink yet
        }

        /* ===============================
           STEP 2: BLINK DETECTION
        =============================== */
        if (ear < EAR_THRESHOLD) {
            blinkCounterRef.current += 1;
        } else {
            if (blinkCounterRef.current >= BLINK_CONSEC_FRAMES) {
                blinkCounterRef.current = 0;
                verifyLockRef.current = true;
                captureAndVerifyFace();
            }
            blinkCounterRef.current = 0;
        }
    };


    /* =====================
       MEDIAPIPE RESULTS
    ===================== */
    // const onResults = (results) => {
    //     if (!results?.multiFaceLandmarks?.length) return;
    //     if (faceVerified || verifyLockRef.current) return;

    //     const landmarks = results.multiFaceLandmarks[0];
    //     const ear = calculateEAR(landmarks);
    //     if (ear === null) return;

    //     if (ear < EAR_THRESHOLD) {
    //         blinkCounterRef.current += 1;
    //     } else {
    //         if (blinkCounterRef.current >= BLINK_CONSEC_FRAMES) {
    //             blinkCounterRef.current = 0;
    //             verifyLockRef.current = true;
    //             captureAndVerifyFace();
    //         }
    //         blinkCounterRef.current = 0;
    //     }
    // };

    /* =====================
       START MEDIAPIPE CAMERA
    ===================== */
    useEffect(() => {
        if (faceVerified) return; // ? stop camera once verified

        let isMounted = true;
        let faceMesh;
        let retryTimeout;

        faceMesh = new FaceMesh({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onResults);

        const startCamera = () => {
            if (!isMounted) return;

            const webcam = webcamRef.current;

            if (
                webcam &&
                webcam.video &&
                webcam.video.readyState === 4
            ) {
                cameraRef.current = new cam.Camera(webcam.video, {
                    onFrame: async () => {
                        if (!isMounted) return;
                        await faceMesh.send({ image: webcam.video });
                    },
                    width: 640,
                    height: 480,
                });

                cameraRef.current.start();
            } else {
                retryTimeout = setTimeout(startCamera, 150);
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            clearTimeout(retryTimeout);

            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }

            if (faceMesh) {
                faceMesh.close();
            }
        };
    }, [faceVerified]);

    /* =====================
       BLINK ? FACE VERIFY
    ===================== */

    const mapPurposeToSelect = (purposeStr) => {
        if (!purposeStr) return [];

        return purposeStr.split(",").map(p => ({
            label: p.trim(),
            value: p.trim()
        }));
    };

    const captureAndVerifyFace = async () => {
        if (!webcamRef.current) return;

        const image = webcamRef.current.getScreenshot();

        if (!image) {
            toast.error("Failed to capture image");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/FaceVerify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                }),
            });

            const data = await response.json();

            if (response.ok && data?.visitor) {
                toast.success("Face verified successfully");

                const visitor = data.visitor;
                setVisitorData(visitor);
                setFaceVerified(true);

                setVisitorImage(data.image || null);

                if (visitor.Status === "IN") {
                    setRemarks(visitor.Remarks || "");
                    setVehicleNo(visitor.Vehicle_Number || "");
                    setTagNo(visitor.Tag_No || "");

                    const purposeOptions = mapPurposeToSelect(visitor.Purpose);
                    setSelectedPurpose(purposeOptions);
                    setPurpose(visitor.Purpose || "");

                    const statusOptions = mapPurposeToSelect(visitor.TStatus);
                    setSelectedStatus(statusOptions);
                    setStatus(visitor.TStatus || "");

                    setEntryDate(
                        visitor.Entry_date_Time
                            ? visitor.Entry_date_Time.split("T")[0]
                            : ""
                    );
                }

                if (visitor.Status === "OUT") {
                    setRemarks("");
                    setVehicleNo("");
                    setSelectedPurpose([]);
                    setPurpose("");
                    setEntryDate(getTodayDate());
                }

            } else {
                resetForNextVisitor();
                toast.warning(data.message || "Face verification failed");
            }
        } catch (err) {
            resetForNextVisitor();
            console.error("Face verify error:", err);
            toast.error("Face verification error");
        } finally {
            setLoading(false);
        }
    };

    const clearInputFields = () => {
        setStatus("");
        setSelectedStatus("");
        setEntryDate("");
        setPurpose("");
        setSelectedPurpose([]);
        setVehicleNo("");
        setRemarks("");
        setTagNo("")
    };

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        fetch(`${config.apiBaseUrl}/status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((val) => {
                setStatusDrop(val);

                if (val.length > 0) {
                    const firstOption = {
                        value: val[0].attributedetails_name,
                        label: val[0].attributedetails_name,
                    };
                    setSelectedStatus(firstOption);
                    setStatus(firstOption.value);
                }

            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        fetch(`${config.apiBaseUrl}/getPurpose`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((val) => setPurposeDrop(val))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const filteredOptionStatus = statusDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filteredOptionPurpose = purposeDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangeStatus = (selectedStatus) => {
        setSelectedStatus(selectedStatus);
        setStatus(selectedStatus ? selectedStatus.value : "");
    };

    const handleChangePurpose = (selectedPurpose) => {
        setSelectedPurpose(selectedPurpose);

        if (!selectedPurpose || selectedPurpose.length === 0) {
            setPurpose("");
            return;
        }

        const values = selectedPurpose.map(opt => opt.value);

        setPurpose(values.join(","));
    };

    const handleCheckIn = async () => {
        if (!entryDate || !purpose || !vehicleNo) {
            setError(" ");
            toast.warning("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/AttendanceTransaction`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        company_code: sessionStorage.getItem("selectedCompanyCode"),
                        entryDate,
                        Visitor_ID: visitorData.Keyfield,
                        purpose,
                        vehicleNo,
                        status,
                        remarks,
                        Tag_No: tagNo,
                        type: "IN",
                        created_by: sessionStorage.getItem("selectedUserCode")
                    })
                }
            );

            if (response.ok) {
                toast.success("Check-In Successful");
                blinkCooldownUntilRef.current = Date.now() + BLINK_COOLDOWN_MS;
                resetForNextVisitor();
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.warning(errorResponse.message);
            }
        } catch (error) {
            console.error("Error inserting data:", error);
            toast.error("Error inserting data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!entryDate) {
            setError(" ");
            toast.warning("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/AttendanceTransaction`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        company_code: sessionStorage.getItem("selectedCompanyCode"),
                        entryDate,
                        Visitor_ID: visitorData.Keyfield,
                        type: "OUT",
                        modified_by: sessionStorage.getItem("selectedUserCode")
                    })
                }
            );

            if (response.ok) {
                toast.success("Check-Out Successful");
                blinkCooldownUntilRef.current = Date.now() + BLINK_COOLDOWN_MS;
                resetForNextVisitor();
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.warning(errorResponse.message);
            }
        } catch (error) {
            console.error("Error inserting data:", error);
            toast.error("Error inserting data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    //Search Criteria
    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        fetch(`${config.apiBaseUrl}/getPurpose`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((data) => {
                const purposeOption = data.map((option) => option.attributedetails_name);
                setpurposeDrop(purposeOption);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);


    const columnDefs = [
        {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params) => {
                const cellWidth = params.column.getActualWidth();
                const isWideEnough = cellWidth > 20;
                const showIcons = isWideEnough;
                return (
                    <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%', justifyContent: 'center' }}>
                        {showIcons && (
                            <>
                                <span
                                    className="icon mx-2"
                                    onClick={() => saveEditedData(params.data, params.node.data)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="fa-regular fa-floppy-disk" title="Save"></i>
                                </span>

                                <span
                                    className="icon mx-2"
                                    onClick={() => deleteSelectedRows(params.data)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="fa-solid fa-trash" title="Delete"></i>
                                </span>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            headerName: "Check-Out",
            field: "checkoutAction",
            cellRenderer: (params) => {
                const isCheckedOut = !!params.data.Check_Out;

                return (
                    <button
                        className={`btn btn-sm ${isCheckedOut ? "btn-secondary" : "btn-danger"
                            }`}
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() =>
                            fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionHandler`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    Visitor_ID: params.data.Visitor_ID,
                                    Trans_Screen: "CheckOUT-Manual",
                                    Entry_date_Time: params.data.Entry_date_Time,
                                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                                    Modified_by: sessionStorage.getItem("selectedUserCode"),
                                    mode: "CO",
                                }),
                            })
                                .then((res) => res.json())
                                .then((data) => {
                                    if (data.success) {
                                        toast.success(data.message);
                                        reloadGridData();
                                    } else {
                                        toast.error(data.message);
                                    }
                                })
                                .catch(() => toast.error("Checkout failed"))
                        }
                        disabled={params.data.Check_Out}   // ? unchanged
                    >
                        Check OUT
                    </button>
                );
            },
        },
        {
            headerName: "Check-IN",
            field: "check_in",
            editable: false,
            cellStyle: { textAlign: "left" },
            // valueFormatter: (params) => {
            //     if (!params.value) return "";
            //     const d = new Date(params.value);
            //     const day = String(d.getDate()).padStart(2, "0");
            //     const month = String(d.getMonth() + 1).padStart(2, "0");
            //     const year = d.getFullYear();
            //     const hh = String(d.getHours()).padStart(2, "0");
            //     const mm = String(d.getMinutes()).padStart(2, "0");
            //     const ss = String(d.getSeconds()).padStart(2, "0");
            //     return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
            // },
        },
        {
            headerName: "Check-Out",
            field: "Check_Out",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 250,
            },
            // valueFormatter: (params) => {
            //     if (!params.value) return "";

            //     const d = new Date(params.value);

            //     const day = String(d.getDate()).padStart(2, "0");
            //     const month = String(d.getMonth() + 1).padStart(2, "0");
            //     const year = d.getFullYear();

            //     const hh = String(d.getHours()).padStart(2, "0");
            //     const mm = String(d.getMinutes()).padStart(2, "0");
            //     const ss = String(d.getSeconds()).padStart(2, "0");

            //     return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
            // },
        },

        {
            headerName: "Entry date",
            field: "Entry_date_Time",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 18,
            },
            valueGetter: (params) => {
                if (!params.data?.Entry_date_Time) return "";
                return params.data.Entry_date_Time.split("T")[0];
            }
        },
        {
            headerName: "Visitor ID",
            field: "Visitor_ID",
            editable: false,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 250,
            },
        },
        {
            headerName: "Visitor Name",
            field: "Visitor_Name",
            editable: false,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 250,
            },
        },
        {
            headerName: "Vehicle Number",
            field: "Vehicle_Number",
            editable: true,
            cellStyle: { textAlign: "left" },

            cellEditorParams: {
                maxLength: 10,
            },
        },
        {
            headerName: "Contact No",
            field: "Phone_No",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 10,
            },
        },
        {
            headerName: "ID Proof",
            field: "ID_Proof",
            cellEditor: "agSelectCellEditor",
            editable: false,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 18,
                values: IdProofTyprDrop,
            },
        },
        {
            headerName: "Purpose",
            field: "Purpose",
            editable: true,
            cellEditor: "agSelectCellEditor",
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 10,
                values: PurposeDrop,
            },
        },
        {
            headerName: "Tag No",
            field: "Tag_No",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 30,
            },
        },
        {
            headerName: "Company Name",
            field: "Company_Name",
            editable: true,
            cellStyle: { textAlign: "left" },

            cellEditorParams: {
                maxLength: 10,
            },
        },
        {
            headerName: "Customer Type",
            field: "Customer_type",
            cellEditor: "agSelectCellEditor",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 18,
                values: CustomerTypeDrop,
            },
        },
        {
            headerName: "ID Proof No",
            field: "ID_Proof_No",
            editable: false,
            cellStyle: { textAlign: "left" },

            cellEditorParams: {
                maxLength: 10,
            },
        },
        // {
        //     headerName: "Status",
        //     field: "Status",
        //     editable: true,
        //     cellStyle: { textAlign: "left" },
        //     cellEditor: "agSelectCellEditor",
        //     cellEditorParams: {
        //         maxLength: 18,
        //         values: StatusDrop,
        //     },
        // },
        {
            headerName: "Expiry Date",
            field: "Expired_Date",
            editable: false,
            cellStyle: { textAlign: "left" },
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                maxLength: 18,
            },
            valueGetter: (params) => {
                if (!params.data?.Expired_Date) return "";
                return params.data.Expired_Date.split("T")[0];
            }
        },
        {
            headerName: "In/Out Type",
            field: "Trans_Screen",
            editable: false,
            width: 400,
            cellStyle: { textAlign: "left" },
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                maxLength: 18
            },
        },
        {
            headerName: "Remarks",
            field: "Remarks",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 250,
            },
        },
        {
            headerName: "Keyfield",
            field: "Keyfield",
            editable: true,
            hide: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: {
                maxLength: 250,
            },
        }
    ];

    const gridOptions = {
        pagination: true,
        paginationPageSize: 10,
    };

    const reloadGridData = () => {
        window.location.reload();
    };

    const reloadData = () => {


        // Dates
        setStartDate('');
        setEndDate('');

        // Text inputs
        setVisitor_Name('');
        setVehicle_NumberSC('');
        setTag_NoSC('');
        setPhone_No('');
        setID_Proof_No('');

        // Dropdowns (react-select)
        setselectedVisitor_IDsearch(null);
        setSelectedStatusSC(null);
        setselectedPurposeSC([]);
        // Optional: clear grid data
        setrowData([]);

    };

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        fetch(`${config.apiBaseUrl}/getIdProofType`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((data) => {
                const idProofTypeOption = data.map((option) => option.attributedetails_name);
                setidProofTypeDrop(idProofTypeOption);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);


    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        fetch(`${config.apiBaseUrl}/getCustomerType`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((data) => {
                const customerTypeOption = data.map((option) => option.attributedetails_name);
                setcustomerTypeDrop(customerTypeOption);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);


    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        fetch(`${config.apiBaseUrl}/status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((data) => {
                const statusOption = data.map((option) => option.attributedetails_name);
                setstatusDrop(statusOption);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        fetch(`${config.apiBaseUrl}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code }),
        })
            .then((response) => response.json())
            .then((val) => {
                setStatusdropSC(val);

                if (val.length > 0) {
                    const firstOption = {
                        value: val[0].attributedetails_name,
                        label: val[0].attributedetails_name,
                    };
                    setSelectedStatusSC(firstOption);
                    setstatusSC(firstOption.value);
                }
            })
            .catch((error) => {
                console.error('Error fetching status data:', error);
            });
    }, []);

    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        fetch(`${config.apiBaseUrl}/getPurpose`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code }),
        })
            .then((response) => response.json())
            .then((val) => {
                setpurposedrop(val);

                if (val.length > 0) {
                    const firstOption = {
                        value: val[0].attributedetails_name,
                        label: val[0].attributedetails_name,
                    };
                    setpurposesc(firstOption.value);
                }
            })
            .catch((error) => {
                console.error('Error fetching status data:', error);
            });
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/GetVisitor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Company_code: sessionStorage.getItem("selectedCompanyCode"),
            }),
        })
            .then((res) => res.json())
            .then((val) => {
                setvisitordropSC(Array.isArray(val) ? val : []);
            });
    }, []);

    const handleChangeStatusSC = (selectedStatus) => {
        setSelectedStatusSC(selectedStatus);
        setstatusSC(selectedStatus ? selectedStatus.value : '');
    };


    const handleChangePurposeSC = (selectedPurpose) => {
        setselectedPurposeSC(selectedPurpose);

        if (!selectedPurpose || selectedPurpose.length === 0) {
            setPurposeSC("");
            return;
        }

        const values = selectedPurpose.map(opt => opt.value);

        setPurposeSC(values.join(","));
    };

    const handlevisitorSC = (selectedOption) => {
        setselectedVisitor_IDsearch(selectedOption);
        setVisitor_IDsearch(selectedOption ? selectedOption.value : "");
    };

    const filteredOptionStatusSC = statusdropSC.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filteredOptionPurposeSC = purposedrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filterOptionVisitorSC = Array.isArray(visitordropSC) ? visitordropSC.map(option => ({
        value: option.Keyfield,
        label: option.Keyfield,
    })) : [];

    const saveEditedData = async () => {
        showConfirmationToast(
            "Are you sure you want to update the data in the selected rows?",
            async () => {
                try {
                    const company_code = sessionStorage.getItem('selectedCompanyCode');
                    const modified_by = sessionStorage.getItem('selectedUserCode');

                    const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

                    const response = await fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionLoopUpdate`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "company_code": company_code,
                            "modified_by": modified_by
                        },
                        body: JSON.stringify(dataToSend)
                    });

                    if (response.ok) {
                        toast.success("Data updated successfully", {
                            onClose: () => handleSearch(), // Runs handleSearch when toast closes
                        });
                    } else {
                        const errorResponse = await response.json();
                        toast.warning(errorResponse.message || "Failed to insert sales data");
                    }
                } catch (error) {
                    console.error("Error deleting rows:", error);
                    toast.error('Error Deleting Data: ' + error.message);
                }
            },
            () => {
                toast.info("Data updated cancelled.");
            }
        );
    };

    const deleteSelectedRows = async (rowData) => {
        const LeaveIdDelete = { LeaveIdToDelete: Array.isArray(rowData) ? rowData : [rowData] };

        showConfirmationToast(
            "Are you sure you want to delete the data in the selected rows?",
            async () => {
                try {
                    const response = await fetch(`${config.apiBaseUrl}/Gate_Pass_TransactionLoopDelete`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(LeaveIdDelete),
                    });

                    if (response.ok) {
                        setTimeout(() => {
                            toast.success("Data deleted successfully");
                            handleSearch();
                        }, 3000);
                    } else {
                        const errorResponse = await response.json();
                        toast.warning(errorResponse.message || "Failed to delete data");
                    }
                } catch (error) {
                    console.error("Error deleting rows:", error);
                    toast.error("Error deleting data: " + error.message);
                }
            },
            () => {
                toast.info("Data delete cancelled.");
            }
        );
    };

    const handleSearch = async () => {
        const start = new Date(StartDate);
        const end = new Date(EndDate);

        if (end < start) {
            toast.warning("End Date should not be earlier than Start Date");
            return;
        }
        try {
            const response = await fetch(`${config.apiBaseUrl}/VisitorSC`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Purpose: filtercode,
                    Visitor_ID: Visitor_IDsearch,
                    StartDate: StartDate,
                    Visitor_Name: Visitor_Name,
                    EndDate: EndDate,
                    Vehicle_Number: Vehicle_NumberSC,
                    Status: StatusSC,
                    Purpose: setpurposesc,
                    Tag_No: Tag_NoSC,
                    Phone_No: Phone_No,
                    ID_Proof_No: ID_Proof_No,
                    company_code: sessionStorage.getItem('selectedCompanyCode'),
                })
            });
            if (response.ok) {
                const searchData = await response.json();
                setrowData(searchData);
                console.log("Data fetched successfully");
            } else if (response.status === 404) {
                console.log("Data not found");
                toast.warning("Data not found");
                setrowData([]);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert sales data");
                setrowData([]);
            }
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error("Error updating data: " + error.message);
        }
    };

    const transformData = (data) => {
        return data.map(row => ({
            "Check-IN": formatDateTime(row.check_in),
            "Check-Out": formatDateTime(row.Check_Out),
            "Entry date": formatDateOnly(row.Entry_date_Time),
            "Visitor ID": row.Visitor_ID,
            "Visitor Name": row.Visitor_Name,
            "Vehicle Number": row.Vehicle_Number,
            "Phone No": row.Phone_No,
            "ID Proof": row.ID_Proof,
            "ID Proof No": row.ID_Proof_No,
            "Purpose": row.Purpose,
            "Tag No": row.Tag_No,
            "Company Name": row.Company_Name,
            "Customer Type": row.Customer_type,
            "Status": row.Status,
            "IN/Out Type": row.Trans_Screen,
            "Remakrs": row.Remarks
        }));
    };

    const handleExcel = () => {
        if (rowData.length === 0) {
            toast.warning('There is no data to export.');
            return;
        }

        const headerData = [
            ['Biometric Face'],
        ];

        const transformedData = transformData(rowData);

        const worksheet = XLSX.utils.aoa_to_sheet(headerData);

        XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Biometric_Face');
        XLSX.writeFile(workbook, 'Biometric Face.xlsx');
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
    }, []);

    const formatDateOnly = (value) => {
        if (!value) return "";
        const d = new Date(value);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const formatDateTime = (value) => {
        if (!value) return "";
        const d = new Date(value);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");

        return `${day}-${month}-${year} ${hh}:${mm}:${ss}`;
    };


    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}

            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* Header */}
            <div className="shadow-lg p-0 bg-body-tertiary rounded mb-2">
                <div className="d-flex justify-content-between align-items-center px-3">
                    <h1 className="purbut">Biometric Face</h1>
                    <h1 className="mobileview fs-4">Biometric Face</h1>
                </div>
            </div>

            {!faceVerified && (
                <div className="card p-3 mt-2 webcam-card">
                    <div className="webcam-content">
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            className="webcam"
                        />

                        <p className="mt-2 text-muted">
                            Look at the camera and blink
                        </p>

                        {loading && <p className="mt-1">Verifying face...</p>}
                    </div>
                </div>
            )}


            {faceVerified && (
                <div className="card p-0 mt-2">
                    <div className="row ms-4 mt-3 mb-3 me-4">
                        <h5>
                            Visitor ID : {visitorData?.Visitor_ID} &nbsp;|&nbsp;
                            Visitor Name : {visitorData?.Visitor_Name} &nbsp;|&nbsp;
                            {visitorData?.ID_Proof} : {visitorData?.ID_Proof_No}
                        </h5>


                        {/* Entry Date */}
                        <div className="col-md-3 mb-2 form-group">
                            <label className={`exp-form-labels ${error && !entryDate ? 'text-danger' : ''}`}>Entry Date<span className="text-danger">*</span></label>
                            <input
                                className="exp-input-field form-control"
                                type="date"
                                value={entryDate}
                                disabled={visitorData?.Status === "IN"}
                                onChange={(e) => setEntryDate(e.target.value)}
                            />
                        </div>

                        {/* Purpose */}
                        <div className="col-md-3 mb-2 form-group">
                            <label className={`exp-form-labels ${error && !purpose ? 'text-danger' : ''}`}>Purpose<span className="text-danger">*</span></label>
                            <Select
                                value={selectedPurpose}
                                onChange={handleChangePurpose}
                                options={filteredOptionPurpose}
                                className="exp-input-field"
                                isMulti
                                isDisabled={visitorData?.Status === "IN"}
                            />
                        </div>

                        {/* Vehicle Number */}
                        <div className="col-md-3 mb-2 form-group">
                            <label className={`exp-form-labels ${error && !vehicleNo ? 'text-danger' : ''}`}>Vehicle Number<span className="text-danger">*</span></label>
                            <input
                                className="exp-input-field form-control"
                                type="text"
                                value={vehicleNo}
                                maxLength={30}
                                disabled={visitorData?.Status === "IN"}
                                onChange={(e) => setVehicleNo(e.target.value)}
                            />
                        </div>

                        {/* Tag Number */}
                        <div className="col-md-3 mb-2 form-group">
                            <label className=" exp-form-labels">Tag No</label>
                            <input
                                className="exp-input-field form-control"
                                type="text"
                                value={tagNo}
                                maxLength={30}
                                disabled={visitorData?.Status === "IN"}
                                onChange={(e) => setTagNo(e.target.value)}
                            />
                        </div>

                        {/* Status */}
                        {/* <div className="col-md-3 mb-2 form-group">
                            <label className="exp-form-labels">Status</label>
                            <Select
                                value={selectedStatus}
                                onChange={handleChangeStatus}
                                options={filteredOptionStatus}
                                className="exp-input-field"
                                isDisabled={visitorData?.Status === "IN"}
                            />
                        </div> */}

                        {/* Remarks */}
                        <div className="col-md-6 form-group mb-2">
                            <label className="exp-form-labels">Remarks</label>
                            <textarea
                                className="exp-input-field form-control"
                                rows="2"
                                value={remarks}
                                disabled={visitorData?.Status === "IN"}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        <div className="col-md-3 d-flex justify-content-center align-items-start">
                            <div className="visitor-image-box">
                                {visitorImage ? (
                                    <img
                                        src={visitorImage}
                                        alt="Visitor"
                                        className="visitor-image"
                                    />
                                ) : (
                                    <div className="image-placeholder">
                                        Image
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex action-buttons justify-content-end gap-3 mt-2 mb-3">

                            {visitorData?.Status === "OUT" && (
                                <button
                                    className="btn btn-success fs-5"
                                    onClick={handleCheckIn}
                                >
                                    <i className="fa-solid fa-right-to-bracket me-2"></i>
                                    Check In
                                </button>
                            )}

                            {visitorData?.Status === "IN" && (
                                <button
                                    className="btn btn-warning fs-5"
                                    onClick={handleCheckOut}
                                >
                                    <i className="fa-solid fa-right-from-bracket me-2"></i>
                                    Check Out
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            )}

            <div className="shadow-lg p-3 bg-light rounded-3 mt-2 mb-2">
                <div class="row">
                    <h6 className="">Search Criteria:</h6>
                    <div className="d-flex justify-content-end me-5">
                        <button className="btn btn-dark mt-2 mb-2 rounded-3" onClick={handleExcel} title='Excel'>
                            <i class="fa-solid fa-file-excel"></i>
                        </button></div>
                    <div class="row ms-2 me-2">
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div><label for="cname" class="exp-form-labels">
                                    Start Date
                                </label></div>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    placeholder=""
                                    required title="Please Enter the Leave ID"
                                    value={StartDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div><label for="cname" class="exp-form-labels">
                                    End Date
                                </label></div>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    placeholder=""
                                    required title="Please Enter the Leave ID"
                                    value={EndDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                            </div>
                        </div>
                        {/* <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div><label for="cname" class="exp-form-labels">
                                    Expired Date
                                </label></div>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    placeholder=""
                                    required title="Please Enter the Leave ID"
                                    value={Expired_Date}
                                    onChange={(e) => setExpired_Date(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                            </div>
                        </div> */}
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div class="d-flex justify-content-start">
                                    <div>
                                        <label for="sname" >Visitor ID
                                        </label>
                                    </div>
                                </div>
                                <Select
                                    id="Visitor_ID"
                                    class="exp-input-field form-control"
                                    placeholder=""
                                    value={selectedVisitor_IDsearch}
                                    onChange={handlevisitorSC}
                                    options={filterOptionVisitorSC}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div class="d-flex justify-content-start">
                                    <div>
                                        <label For="city">Visitor Name</label>
                                    </div>
                                </div>
                                <input
                                    id="Vehicle_Number"
                                    class="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    value={Visitor_Name}
                                    onChange={(e) => setVisitor_Name(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div class="d-flex justify-content-start">
                                    <div>
                                        <label For="city">Vehicle No</label>
                                    </div>
                                </div>
                                <input
                                    id="Vehicle_Number"
                                    class="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    maxLength={30}
                                    required title="Please Enter the Value for Total Days to be Credit "
                                    value={Vehicle_NumberSC}
                                    onChange={(e) => setVehicle_NumberSC(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div class="d-flex justify-content-start">
                                    <div>
                                        <label For="city">Tag No</label>
                                    </div>
                                </div>
                                <input
                                    id="Vehicle_Number"
                                    class="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    maxLength={30}
                                    required title="Please Enter the Value for Total Days to be Credit "
                                    value={Tag_NoSC}
                                    onChange={(e) => setTag_NoSC(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div class="d-flex justify-content-start">
                                    <div>
                                        <label For="city">Contact No </label>
                                    </div>
                                </div>
                                <input
                                    id="Vehicle_Number"
                                    class="exp-input-field form-control"
                                    type="text"
                                    maxLength={15}
                                    placeholder=""
                                    required title="Please Enter the Value for Total Days to be Credit "
                                    value={Phone_No}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, "");
                                        setPhone_No(value)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div class="exp-form-floating">
                                <div class="d-flex justify-content-start">
                                    <div>
                                        <label For="city">ID Proof No</label>
                                    </div>
                                </div>
                                <input
                                    id="Vehicle_Number"
                                    class="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    maxLength={30}
                                    required title="Please Enter the Value for Total Days to be Credit "
                                    value={ID_Proof_No}
                                    onChange={(e) => setID_Proof_No(e.target.value)}
                                />
                            </div>
                        </div>
                        {/*<div className='col-md-3 form-group'>
                            <div className='exp-form-floating'>
                                <label>Status</label>
                                <Select
                                    type='Text'
                                    className='exp p-1'
                                    onChange={handleChangeStatusSC}
                                    value={selectedStatusSC}
                                    required title="Please Select the User ID"
                                    options={filteredOptionStatusSC}
                                />
                            </div>
                        </div>*/}
                        <div className='col-md-3 form-group'>
                            <div className='exp-form-floating'>
                                <label>Purpose</label>
                                <Select
                                    type='Text'
                                    className='exp p-1'
                                    onChange={handleChangePurposeSC}
                                    value={selectedPurposesc}
                                    options={filteredOptionPurposeSC}
                                    isMulti
                                    placeholder="Select purpose"
                                />
                            </div>
                        </div>

                        <div className="col-md-2 form-group mt-3 mb-3">
                            <div class="exp-form-floating">
                                <div class=" d-flex justify-content-center ">
                                    <div class="">
                                        <icon
                                            className="popups-btn fs-6 p-3"
                                            onClick={handleSearch}
                                            required
                                            title="Search"
                                        >
                                            <i className="fas fa-search"></i>
                                        </icon>
                                    </div>
                                    <div>
                                        <icon
                                            className="popups-btn fs-6 p-3"
                                            required
                                            onClick={reloadData}
                                            title="Reload"
                                        >
                                            <i class="fa-solid fa-rotate-right"></i>
                                        </icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            rowSelection="multiple"
                            pagination={true}
                            paginationAutoPageSize={true}
                            gridOptions={gridOptions}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Attendance;