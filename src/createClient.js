// import {createClient} from '@supabase/supabase-js'


// let apiUrl = 'https://xoxzdjzrdyisyobvwjxc.supabase.co'
// let apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveHpkanpyZHlpc3lvYnZ3anhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MTk5MjYsImV4cCI6MjA0Njk5NTkyNn0.rGA8I9v3CZ35-bVj71-RAghjv3DqxG06T_Wo3W1ulps';
// export const supabase = createClient(apiUrl, apiKey) 


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yparjubvkbeytnffqnpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYXJqdWJ2a2JleXRuZmZxbnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTQzODcsImV4cCI6MjA3MzQ5MDM4N30.u_-ZLFNbdOv16-igoCblhu_sAWn-nF-1F2wAPybMReQ'
export const supabase = createClient(supabaseUrl, supabaseKey);