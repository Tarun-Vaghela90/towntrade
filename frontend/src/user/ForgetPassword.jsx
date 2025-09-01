import React from 'react'
import EmailActionCard from './EmailActionCard'

export default function ForgetPassword() {
  return (
    <div>
    
      <EmailActionCard
                  title="Forgot Password"
                  apiEndpoint="/auth/forgot-password"
                  successMessage="Password link has been sent!"
                />
    </div>
  )
}
