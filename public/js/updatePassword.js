import axios from 'axios';
import {showAlert} from './alert';

export const updatePassword = async (currentPassword, newPassword, passwordConfirm) => {
    try{
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:3000/api/v1/users/update-password',
            data: {
                currentPassword,
                newPassword,
                passwordConfirm
            }
        })
        // console.log(res.data.status)
        if(res.data.status === 'success') {
            showAlert('success', 'Password updated successfully');
            window.setTimeout(() => {
                location.reload()
            }, 1500)
        }
       }catch(err) {
           console.error(err);
            showAlert('error', err.message)
       }
} 