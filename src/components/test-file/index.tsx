"use client";
import React, { useEffect } from "react";
import bcrypt from "bcryptjs";

const TestFile: React.FC = () => {
  useEffect(() => {
    const hashPassword = async () => {
      const password = "ahmad123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("Hashed password:", hashedPassword);
    };
    hashPassword();
  }, []);

  return <div>Check the console for the hashed password.</div>;
};

export default TestFile;
