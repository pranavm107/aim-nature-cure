import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import { adminService } from '../../services/adminService';
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { InputField, SelectField, TextareaField, ImageUploadField, PrimaryButton } from '../../components/common/FormFields'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [loading, setLoading] = useState(false)

    const { } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            if (!docImg) {
                toast.error('Image Not Selected')
                setLoading(false)
                return
            }

            const formData = new FormData();
            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            const data = await adminService.addDoctor(formData);
            if (data.success) {
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const experienceOptions = [
        { value: '1 Year', label: '1 Year' },
        { value: '2 Year', label: '2 Years' },
        { value: '3 Year', label: '3 Years' },
        { value: '4 Year', label: '4 Years' },
        { value: '5 Year', label: '5 Years' },
        { value: '6 Year', label: '6 Years' },
        { value: '8 Year', label: '8 Years' },
        { value: '9 Year', label: '9 Years' },
        { value: '10 Year', label: '10 Years' },
    ];

    const specialityOptions = [
        { value: 'General physician', label: 'General physician' },
        { value: 'Gynecologist', label: 'Gynecologist' },
        { value: 'Dermatologist', label: 'Dermatologist' },
        { value: 'Pediatricians', label: 'Pediatricians' },
        { value: 'Neurologist', label: 'Neurologist' },
        { value: 'Gastroenterologist', label: 'Gastroenterologist' },
    ];

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                
                <ImageUploadField 
                    label={<span>Upload doctor <br /> picture</span>}
                    image={docImg}
                    onChange={setDocImg}
                    placeholderImg={assets.upload_area}
                />

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <InputField label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
                        <InputField label="Doctor Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                        <InputField label="Set Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                        <SelectField label="Experience" value={experience} onChange={e => setExperience(e.target.value)} options={experienceOptions} />
                        <InputField label="Fees" type="number" value={fees} onChange={e => setFees(e.target.value)} placeholder="Doctor fees" required />
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <SelectField label="Speciality" value={speciality} onChange={e => setSpeciality(e.target.value)} options={specialityOptions} />
                        <InputField label="Degree" value={degree} onChange={e => setDegree(e.target.value)} placeholder="Degree" required />
                        
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address <span className="text-red-500">*</span></p>
                            <input onChange={e => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2 outline-none focus:border-primary mb-2' type="text" placeholder='Address 1' required />
                            <input onChange={e => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2 outline-none focus:border-primary' type="text" placeholder='Address 2' required />
                        </div>
                    </div>
                </div>

                <div className='mt-4'>
                    <TextareaField label="About Doctor" value={about} onChange={e => setAbout(e.target.value)} placeholder="Write about doctor" />
                </div>

                <PrimaryButton type="submit" className='mt-6' disabled={loading}>
                    {loading ? 'Adding...' : 'Add doctor'}
                </PrimaryButton>
            </div>
        </form>
    )
}

export default AddDoctor