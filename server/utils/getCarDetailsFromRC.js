const API_ID = "APID2056";
const API_KEY = "e8784ab3-873a-403f-802b-e1d7ec6dd8a3";
const TOKEN_ID = "dDzJt2Xec2qwn37fVOYylVa8V6uSaUkB";

// Environment toggle: "prod" or "uat"
const ENVIRONMENT = "prod";

const BASE_URLS = {
  prod: "https://javabackend.idspay.in/api/v1/prod",
  uat: "https://javabackend.idspay.in/api/v1/uat",
};

const ENDPOINT = "/srv2/validation/rc";

// ─── Internal Mapper ──────────────────────────────────────────────────────────
function mapRCApiToCarData(d = {}) {
  const mfgYear = d.vehicle_manufacturing_month_year
    ? d.vehicle_manufacturing_month_year.split("/").pop()
    : null;

  return {
    // Basic Vehicle Info
    make: d.vehicle_manufacturer_name || null,
    model: d.model || null,
    variant: d.norms_type || null,
    bodyType: d.body_type || null,
    fuelType: d.type || null,
    vehicleClass: d.class || null,
    color: d.vehicle_colour || null,
    seatingCapacity: d.vehicle_seat_capacity || null,
    manufacturingYear: mfgYear || null,

    // Owner & Registration
    ownerName: d.owner_name || null,
    fatherName: d.owner_father_name || null,
    rtoOffice: d.reg_authority || null,
    registrationDate: d.reg_date || null,
    registrationValidity: d.rc_expiry_date || null,
    rcNumber: d.reg_no || null,
    ownerCount: d.owner_count || null,
    rtoCode: d.rto_code || null,

    // Insurance
    insuranceCompany: d.vehicle_insurance_company_name || null,
    insuranceValidity: d.vehicle_insurance_upto || null,
    insurancePolicyNumber: d.vehicle_insurance_policy_number || null,

    // Technical Details
    chassisNumber: d.chassis || null,
    engineNumber: d.engine || null,
    cubicCapacity: d.vehicle_cubic_capacity || null,
    grossWeight: d.gross_vehicle_weight || null,
    unladenWeight: d.unladen_weight || null,
    wheelbase: d.wheelbase || null,
    cylinderCount: d.vehicle_cylinders_no || null,
    vehicleCategory: d.vehicle_category || null,

    // Status & Compliance
    rcStatus: d.status || null,
    statusAsOn: d.status_as_on || null,
    taxValidity: d.vehicle_tax_upto || null,
    puccNumber: d.pucc_number || null,
    puccValidity: d.pucc_upto || null,
    isCommercial: d.is_commercial ?? false,
    financed: d.financed ?? false,
    financer: d.rc_financer || null,

    // Legal
    blacklistStatus: d.blacklist_status || null,
    blacklistDetails: d.blacklist_details || [],
    challanDetails: d.challan_details || [],

    // Address
    presentAddress: d.present_address || null,
    permanentAddress: d.permanent_address || null,
  };
}

// ─── Main Function ────────────────────────────────────────────────────────────
async function getCarDetailsFromRC(rcNumber) {
  if (!rcNumber || typeof rcNumber !== "string") {
    throw new Error("Invalid RC number: must be a non-empty string.");
  }

  const baseUrl = BASE_URLS[ENVIRONMENT] || BASE_URLS.uat;
  const url = `${baseUrl}${ENDPOINT}`;

  const requestBody = {
    api_id: API_ID,
    api_key: API_KEY,
    token_id: TOKEN_ID,
    reg_no: rcNumber.trim().toUpperCase(),
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch (networkError) {
    throw new Error(`Network request failed: ${networkError.message}`);
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (parseError) {
    throw new Error(`Failed to parse API response: ${parseError.message}`);
  }

  // ✅ Success — map karke return karo
  if (response.ok && responseData?.status?.code === 200) {
    return {
      success: true,
      message: responseData.message,
      carData: mapRCApiToCarData(responseData.data), // ← seedha screen-ready object
    };
  }

  // ❌ Verification failed (e.g. HTTP 422)
  if (responseData?.success === false) {
    throw new Error(
      `Verification Failed: ${responseData.message || "Unknown error"} (code: ${responseData.status_code || response.status})`
    );
  }

  // ❌ Generic API error
  throw new Error(
    `API Error: ${responseData?.status?.message || response.statusText} (HTTP ${response.status})`
  );
}

module.exports = getCarDetailsFromRC;