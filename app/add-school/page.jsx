'use client';
import { useForm } from 'react-hook-form';
import { useState,useEffect } from 'react';
import '../add-school/pageadd.css';

export default function AddSchoolPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

   const genderOptions = [
    "Boys' school",
    "Girls' school",
    "Coeducation"
  ];

  const indianStatesAndUTs = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
   const [inputValue, setInputValue] = useState('');
  // Filter list only if input has at least 1 character
  const filteredStates =
    inputValue.length > 0
      ? indianStatesAndUTs.filter((state) =>
          state.toLowerCase().startsWith(inputValue.toLowerCase())
        )
      : [];

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('image', data.image[0]);
    Object.keys(data).forEach(key => {
      if (key !== 'image') formData.append(key, data[key]);
    });

    try {
      const response = await fetch('/api/schools', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        setStatusMessage({ success: true, message: 'School added successfully!' });
        reset();
      } else {
        setStatusMessage({ success: false, message: `Error: ${result.error}` });
      }
    } catch (error) {
      setStatusMessage({ success: false, message: `An error occurred: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000); // Message will disappear after 3 seconds

    
      return () => clearTimeout(timer);
    }
  }, [statusMessage]); 

  return (
    <>
     {statusMessage && (
        <div 
          className={`toast-notification ${statusMessage.success ? 'success' : 'error'}`}
        >
          {statusMessage.message}
        </div>
      )}

    <div className="container">

      <div className="content">
        <div className="header">
          <h1>Add New School</h1>
          <a href="/show-schools" className="link-button">View All Schools</a>
        </div>

       
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="name">School Name</label>
            <input id="name" type="text" placeholder="Enter school name..." {...register('name', { required: 'School name is required' })} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input id="address" type="text" placeholder="Enter address" {...register('address', { required: 'Address is required' })} />
            {errors.address && <p className="error-text">{errors.address.message}</p>}
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="city">City</label>
              <input id="city" type="text" placeholder="Enter city" {...register('city', { required: 'City is required' })} />
              {errors.city && <p className="error-text">{errors.city.message}</p>}
            </div>
            <div className="form-group half-width">
              <label htmlFor="state">State</label>
             <input 
              id="state" 
              type="text" 
              list="state-list" 
              {...register('state', { required: 'State is required' })} 
              autoComplete="off"
              value={inputValue}
        onChange={handleChange}
        placeholder="Select a state..."
            />               
            <datalist id="state-list">
              {indianStatesAndUTs.map(state => (
                <option key={state} value={state} />
              ))}
            </datalist>
              {errors.state && <p className="error-text">{errors.state.message}</p>}
            </div>
          </div>

          <div className="form-row">
           
            <div className="form-group half-width">
              <label htmlFor="email_id">Email</label>
              <input
                id="email_id"
                type="email"
                placeholder="Enter email"
                {...register('email_id', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                })}
              />
              {errors.email_id && <p className="error-text">{errors.email_id.message}</p>}
            </div>
             <div className="form-group half-width">
              <label htmlFor="contact">Contact</label>
              <input id="contact" type="tel" placeholder="Enter contact number"{...register('contact', { required: 'Contact is required' })} />
              {errors.contact && <p className="error-text">{errors.contact.message}</p>}
            </div>
          </div>

          
            <div className="form-group full-width">
              <label>Board (select all that apply)</label>
              <div className="checkbox-group">
                {['State', 'CBSE', 'ICSE', 'IGCSE','ISC', 'IB'].map((board) => (
                  <label key={board} className="checkbox-label">
                    <input
                    className='check'
                      type="checkbox"
                      {...register('board', { required: 'At least one board is required' })}
                      value={board}
                    />
                    <span>{board}</span>
                  </label>
                ))}
              </div>
              {errors.board && <p className="error-text">{errors.board.message}</p>}
            </div>


             <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="website">Website</label>
              <input id="website" type="text" placeholder="Enter website" {...register('website')} />
              {errors.website && <p className="error-text">{errors.website.message}</p>}
            </div>

              <div className="form-group half-width">
            <label htmlFor="type">Gender Composition</label>
            <input 
              id="type" 
              type="text" 
              list="gender-list" 
              placeholder="Select gender composition"
              {...register('type', { required: 'Gender Composition is required' })}
              autoComplete="off" 
            />
            <datalist id="gender-list">
              {genderOptions.map(gender => (
                <option key={gender} value={gender} />
              ))}
            </datalist>
            {errors.type && <p className="error-text">{errors.type.message}</p>}
          </div>

            </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              {...register('image', { required: 'Image is required' })}
            />
            {errors.image && <p className="error-text">{errors.image.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Adding School...' : 'Add School'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}