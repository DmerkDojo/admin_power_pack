/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { useState, useRef, useContext } from 'react'
import { ExtensionContext } from '@looker/extension-sdk-react'
import { makeLookerCaller } from './Constants.js'
import {
    Box,
    Flex,
    Icon,
    InlineInputText
} from '@looker/components'

export function InlineEditEmail(props) {
    const context = useContext(ExtensionContext)
    const lookerRequest = makeLookerCaller(context.coreSDK)

    const originalValue = props.sdkUser?.credentials_email?.email || ""
    
    const [lastSavedEmail, setLastSavedEmail] = useState(originalValue)
    const [value, setValue] = useState(originalValue)
    const [status, setStatus] = useState(null)
    
    const inputRef = useRef(null)

    const onChange = (e) => {
        const new_value = e.currentTarget.value.trim()
        
        if (new_value !== lastSavedEmail) { setStatus("Editing") }

        setValue(new_value)
    }

    const onBlur = (e) => {
        if (status === "Error") {
            setValue(lastSavedEmail)
            setStatus(null)
        }
    }

    const onKeyDown = (e) => {
        const key = e.nativeEvent.key
        
        // if Enter is pressed, submit the changes
        if (key === "Enter") {
            // sdk won't update a cred_email object that doesn't exist in the first place...
            const op = lastSavedEmail ? "update" : "create"
            lookerRequest(`${op}_user_credentials_email`, props.sdkUser.id, {email: value})
                .then((result) => {
                    setLastSavedEmail(value)
                    setStatus("Saved")
                    inputRef.current.blur()
                })
                .catch(error => {
                    console.log(error)
                    setStatus("Error")
                })
          }

        // if Escape is pressed, revert the changes
        if (key === "Escape") {
            setValue(lastSavedEmail)
            setStatus(null)
            inputRef.current.blur()
        }
    }

    function renderIcon() {
        let icon
        switch (status) {
            case "Editing":
                icon = <Icon name="CircleAdd" color="palette.yellow500" />    
                break
            case "Updating":
                icon = <Icon name="Update" color="palette.charcoal500"/>
                break
            case "Saved":
                icon = <Icon name="CircleCheck" color="palette.green500"/>
                break
            case "Error":
                icon = <Icon name="CircleCancel" color="palette.red500"/>
                break
        }
        return icon
    }


    /*
     ******************* Rendering *******************
     */
    if (props.sdkUser.is_disabled) {
        return (
            value
        )
    }
    return (
        <Flex>
            <InlineInputText
                ref={inputRef}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
            />
            <Box>{renderIcon()}</Box>
        </Flex>

    )
}