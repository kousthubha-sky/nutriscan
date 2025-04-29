import { useState } from "react"
import { Upload, Barcode, Package, Info, X, AlertCircle } from "lucide-react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { SuccessCheckmark } from "../ui/SuccessCheckmark"

export function ContributeSection() {
  const [formData, setFormData] = useState({
    productName: "",
    barcodeNumber: "",
    additionalInfo: "",
    productImage: null,
    barcodeImage: null
  })

  const [preview, setPreview] = useState({
    productImage: null,
    barcodeImage: null
  })

  const [showSuccess, setShowSuccess] = useState(false)

  const submissionCriteria = [
    "Product name must be accurate and complete",
    "Barcode number must be valid and visible in the photo",
    "Product photos must be clear and well-lit",
    "Image size should not exceed 5MB",
    "Only JPEG, PNG and GIF formats are accepted",
    "Barcode must be clearly visible and scannable",
    "Product face should show nutritional information if available"
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error("Only JPEG, PNG and GIF images are allowed")
        return
      }

      setFormData(prev => ({
        ...prev,
        [type]: file
      }))
      setPreview(prev => ({
        ...prev,
        [type]: URL.createObjectURL(file)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields first
      if (!formData.productName || !formData.barcodeNumber) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate images
      if (!formData.productImage || !formData.barcodeImage) {
        toast.error("Both product and barcode images are required");
        return;
      }

      const submissionData = new FormData();
      submissionData.append('productName', formData.productName);
      submissionData.append('barcodeNumber', formData.barcodeNumber);
      submissionData.append('additionalInfo', formData.additionalInfo);

      if (formData.productImage) {
        submissionData.append('productImage', formData.productImage);
      }
      if (formData.barcodeImage) {
        submissionData.append('barcodeImage', formData.barcodeImage);
      }

      // Submit to backend
      const response = await api.submitProduct(submissionData);
      
      if (!response.success) {
        throw new Error(response.message || 'Submission failed');
      }

      // Show success animation
      setShowSuccess(true);

      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          productName: "",
          barcodeNumber: "",
          additionalInfo: "",
          productImage: null,
          barcodeImage: null
        });
        setPreview({
          productImage: null,
          barcodeImage: null
        });
      }, 1500);

      toast.success('Product submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('LIMIT_FILE_SIZE')) {
        toast.error("File size too large. Maximum size is 5MB");
      } else if (error.message?.includes('Invalid file type')) {
        toast.error("Invalid file type. Only JPEG, PNG and GIF images are allowed");
      } else if (error.message?.includes('Authentication')) {
        toast.error("Please log in to submit a product");
      } else {
        toast.error(error.message || "There was an error submitting your contribution. Please try again.");
      }
    }
  };

  return (
    <section id="contribute" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <SuccessCheckmark isVisible={showSuccess} />
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Contribute Product Information</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Help improve our database by contributing product information. Please provide clear photos and accurate details.
        </p>

        {/* Submission Criteria */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Submission Criteria</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {submissionCriteria.map((criterion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {criterion}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Package className="w-4 h-4" />
                Product Name*
              </label>
              <input
                type="text"
                name="productName"
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Enter product name..."
                value={formData.productName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Barcode className="w-4 h-4" />
                Barcode Number*
              </label>
              <input
                type="text"
                name="barcodeNumber"
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Enter barcode number..."
                value={formData.barcodeNumber}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2">Product Face Photo*</label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] relative">
                {preview.productImage ? (
                  <div className="relative w-full h-[150px]">
                    <img
                      src={preview.productImage}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(prev => ({ ...prev, productImage: null }))
                        setFormData(prev => ({ ...prev, productImage: null }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                      Drag and drop product photo here, or click to browse
                    </p>
                    <input
                      type="file"
                      required={!formData.productImage}
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'productImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2">Barcode Photo*</label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] relative">
                {preview.barcodeImage ? (
                  <div className="relative w-full h-[150px]">
                    <img
                      src={preview.barcodeImage}
                      alt="Barcode preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(prev => ({ ...prev, barcodeImage: null }))
                        setFormData(prev => ({ ...prev, barcodeImage: null }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                      Drag and drop barcode photo here, or click to browse
                    </p>
                    <input
                      type="file"
                      required={!formData.barcodeImage}
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'barcodeImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Info className="w-4 h-4" />
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-[150px]"
                placeholder="Enter any additional details about the product..."
                value={formData.additionalInfo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Upload className="w-4 h-4" />
            Submit Contribution
          </button>
        </form>
      </div>
    </section>
  )
}