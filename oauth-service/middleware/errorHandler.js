function errorHandler(err, req, res, next) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(statusCode).json({
      error: message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
  
  module.exports = errorHandler;