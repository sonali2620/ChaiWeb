const createResult = (error, data, message) => {
  if (error) {
    return {
      status: "error",
      error: typeof error === "string" ? error : error.message || "An error occurred",
      message: message || (typeof error === "string" ? error : error.message)
    };
  }

  return {
    status: "success",
    data,
    message: message || "Success"
  };
};

const success = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    data,
    message
  });
};

const error = (res, errorMsg = "Something went wrong", statusCode = 400) => {
  return res.status(statusCode).json({
    status: "error",
    error: errorMsg,
    message: errorMsg
  });
};

const notFound = (res, message = "Resource not found") => {
  return res.status(404).json({
    status: "error",
    error: message,
    message
  });
};

const unauthorized = (res, message = "Unauthorized access") => {
  return res.status(401).json({
    status: "error",
    error: message,
    message
  });
};

const serverError = (res, message = "Internal server error") => {
  return res.status(500).json({
    status: "error",
    error: message,
    message
  });
};

export default {
  createResult,
  success,
  error,
  notFound,
  unauthorized,
  serverError
};
