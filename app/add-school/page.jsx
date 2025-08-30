"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

export default function AddSchoolPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("image", data.image[0]);
    Object.keys(data).forEach((key) => {
      if (key !== "image") formData.append(key, data[key]);
    });

    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setStatusMessage({
          success: true,
          message: "School added successfully!",
        });
        reset();
      } else {
        setStatusMessage({ success: false, message: `Error: ${result.error}` });
      }
    } catch (error) {
      setStatusMessage({
        success: false,
        message: `An error occurred: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Add New School</h1>
          <a
            href="/"
            className="inline-block px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-sm hover:bg-gray-700 transition-colors"
          >
            View All Schools
          </a>
        </div>
        {statusMessage && (
          <div
            className={`p-4 mb-4 rounded-md text-white font-semibold text-center ${
              statusMessage.success ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {statusMessage.message}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form fields */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              School Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "School name is required" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              id="address"
              type="text"
              {...register("address", { required: "Address is required" })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                {...register("city", { required: "City is required" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700"
              >
                State
              </label>
              <input
                id="state"
                type="text"
                {...register("state", { required: "State is required" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700"
              >
                Contact
              </label>
              <input
                id="contact"
                type="tel"
                {...register("contact", { required: "Contact is required" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contact.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email_id"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email_id"
                type="email"
                {...register("email_id", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.email_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email_id.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="board"
                className="block text-sm font-medium text-gray-700"
              >
                Board
              </label>
              <select
                id="board"
                {...register("board", { required: "Board is required" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select Board --</option>
                <option value="State">State</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="IGCSE">IGCSE</option>
                <option value="IB">IB</option>
              </select>
              {errors.board && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.board.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Website
              </label>
              <input
                id="website"
                type="text"
                {...register("website")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              {...register("image", { required: "Image is required" })}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">
                {errors.image.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? "Adding School..." : "Add School"}
          </button>
        </form>
      </div>
    </div>
  );
}
