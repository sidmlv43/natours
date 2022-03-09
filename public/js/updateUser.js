import axios from 'axios';
import {showAlert} from './alert';

export const updateUser = async (data) => {
    console.log(data)
    try{
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:3000/api/v1/users/update-me',
            data
        })

        if(res.data.status === 'success') {
            showAlert('success', 'updated successfully');
            window.setTimeout(() => {
                location.reload()
            }, 800)
        }
       }catch(err) {
        //    console.error(err);
            showAlert('error', err.message)
       }
}