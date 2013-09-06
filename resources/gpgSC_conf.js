// --- READER
var openpgpsc_reader_name="Plug-up";

// --- OFF CARD --- (passphrase is: foo)
var pgppubkey_offcard = 
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n'+
        'Version: GnuPG v1.4.11 (GNU/Linux)\n'+
        '\n'+
        'mQENBFIfRNwBCAC+Ba34gejCQx1QEMzWpki0hT77fVgAcYWtpjndQEG2CuLTAHoW\n'+
        'V4RPILHR4pTbjx7U/3pEDUOue5UHUvDjdHpdIWxi/oGrIhJvB+rXeLKmUHXNfHgX\n'+
        '2QmYTxMgus9b1vWwkqg2+EXCNWMUPb/V/BoatE4uCfKz7Ii+sCPjGMKRQsDYSLF3\n'+
        'qlIYz9PRd9SwhvovfqjXn2AK0u6gLmW30G7Mzbx79zvnVBLuerC3YttPzZ5wWT59\n'+
        'xINWbnKbsjaVf8jbg/0Q/ZYRUZ+XGZY/qOzIn1Hr8eyK9vfuog3G50oP/23kuvJJ\n'+
        'qX7tvpeYMKM0YAOwJE6bRPYAkJ3hgfRtXJW3ABEBAAG0GmdwZzIwNDggPGdwZzIw\n'+
        'NDhAbm8ud2hlcmU+iQE4BBMBAgAiBQJSH0TcAhsDBgsJCAcDAgYVCAIJCgsEFgID\n'+
        'AQIeAQIXgAAKCRCwyVcLNrl4JEUQCACezhVxhswTPvJ4r0v80rmvb6PCfJAsq2P4\n'+
        'xH4ryxtNIH/6raW1OfzGWOTOX/MXOLR4rX+EgNni8rln+hTZ9Z24wTG3LiZr8Da4\n'+
        'QyPvN86uuT99OLA+64zwCMojjtTkZFb7RjhgDAQTtxIl7KhPbQFo/SYkP9huV5uZ\n'+
        'OeTdzRViHQsKyXysBECHKeHKj4BwX10MaVL5/yitg1S3TAu8rCxHtEDUb1ryFi6F\n'+
        'CI2qIi8B0WMQdAYw+CscxSRLlUm4T2H14Ml5O24FTN3TBGn6HdDq1j0rdZ6Nkjpf\n'+
        'JMXruSDGBIgqsEkHhAbWFYamsDyoBqkf+n7WJLKQsonIIodOqNU0uQENBFIfRNwB\n'+
        'CADXhZDCR4oNbojk9u33mB12VS8AmQSBcNDXZBrie7KXZ+NeICxzCPJzeWpErsxk\n'+
        'ZaeEzG/K7QpxCbwBGH6szFgmbs2HSnYsQOShx7ySFVl0JyshPjEnZ8YGS4FYQ423\n'+
        'qaYm68I1newGqHJqDDF8Zjpt7rAxRQWL4AdujWsLrtHH2V9NIx2iXT5UQTY91dgo\n'+
        'j72FQ6ST4rM16RgAS+OaWcMWRF5uyVzucH2KfzAGmQgW89kamZ8sUc50mYEIKUg6\n'+
        '4kA4t0v49MtI8eUIwwzw1r+DI4Ph9mFlxzwXlH2XP9MnyV+WSnuffXomu3g8DOy3\n'+
        '2w3vWTG+FJIBuMQXxZuoJckNABEBAAGJAR8EGAECAAkFAlIfRNwCGwwACgkQsMlX\n'+
        'Cza5eCQALAf/WPSvN3fROR9vYzm2mrUw/CLcefkhdz7AktDjAUd9ktf2x1ihp9q/\n'+
        '2GrvFNAW3F1tY7s5rlsjKj8jpXR5zLpChP7OAqsbULce+TFnTng+5JD09zMytENX\n'+
        't0XPayiX5ZE0zmgWNNVyNxh66aabu/MDAW/P58mvUUeH4ij9h8oOGwnimxWHH7Pm\n'+
        '/1u1DS+KFTniq7inESQV0izQ5GmBtmw7WOma/Uessg48Q1LGq75iLY8SQPtuO3qi\n'+
        'OtKd0vz53P4c0KTQPnf9IHaLgTVbbNVilRxPWz8sAn/PurY+tPOeEs6+JgtR5Gy5\n'+
        '1pLX335RYFyK+NP+N38TuDgp/ySre7K7Xg==\n'+
        '=o7fQ\n'+
        '-----END PGP PUBLIC KEY BLOCK-----\n'

var pgpprivkey_offcard = 
        '-----BEGIN PGP PRIVATE KEY BLOCK-----\n'+
        'Version: GnuPG v1.4.11 (GNU/Linux)\n'+
        '\n'+
        'lQO+BFIfRNwBCAC+Ba34gejCQx1QEMzWpki0hT77fVgAcYWtpjndQEG2CuLTAHoW\n'+
        'V4RPILHR4pTbjx7U/3pEDUOue5UHUvDjdHpdIWxi/oGrIhJvB+rXeLKmUHXNfHgX\n'+
        '2QmYTxMgus9b1vWwkqg2+EXCNWMUPb/V/BoatE4uCfKz7Ii+sCPjGMKRQsDYSLF3\n'+
        'qlIYz9PRd9SwhvovfqjXn2AK0u6gLmW30G7Mzbx79zvnVBLuerC3YttPzZ5wWT59\n'+
        'xINWbnKbsjaVf8jbg/0Q/ZYRUZ+XGZY/qOzIn1Hr8eyK9vfuog3G50oP/23kuvJJ\n'+
        'qX7tvpeYMKM0YAOwJE6bRPYAkJ3hgfRtXJW3ABEBAAH+AwMCYTetPSE2lRVgkHu2\n'+
        '1zfvP7Qbq2yovXGrR23z9lZziiTD/bS8vnt5OQswYGxlH5G5M2V6Izs0Qy6CdVMh\n'+
        'tQfsmD5+Xk1EBjZbcCl7tmzPj/dhuGZjM0wUYOmfID6KLXKDGs0Q3bNRuIlKkx+/\n'+
        'CWUJ81m+An0+rENosgHIG4jbni/JybXqFbL3LfKx1Mi4RttS6OLGvZRihlOUrsDU\n'+
        'ju9HjWBnZZSwhOrgxYa1d6FGjJp84HJPw8F4xObdVQ5QHyw/TdphsxBDmyeDcGbT\n'+
        'oRs4ehdL+/JTcxBl83twq70DPIAw5vG2ky6+VuYjtKw2rUxwgdk0xwyO9FN5nIHZ\n'+
        'N44kujvS88a3cGviRaeTPteOz0ck0dvys2vdVm1t5jBBMZhCuGpMLkPli5EtgZH4\n'+
        'c8tzpzL1jMA1AQl9xiyL95FU8VAWHAxWTMXSHO6XLPZra1bCTwYxPu0ye7pHDGKJ\n'+
        'OLKs7cwG+Pba9kB7H3krgpiAsMsHlPmUXXQYo6HgKprSFJ8CWhT7eFqEO7/8PngH\n'+
        'j+YbdwYPhZ/aEN5pipeaOI3jLGR2OyFl1YR983Z9hrlKMnh5NQqtu7X46Y36Zj1q\n'+
        '+/VDa3ojaxqy6/y8/jivkpV7/Tq1NnGcyarw2KnOg8L6IwLzTYcdM3SX+gOmp13a\n'+
        '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\n'+
        'E7g4Kf8kq3uyu14=\n'+
        '=zeXS\n'+
        '-----END PGP PRIVATE KEY BLOCK-----\n';

/* ON CARD */
var pgppubkey_oncard = "UNDEFINED: EDIT KEYS.JS";
var pgpprivkey_oncard = "UNDEFINED: EDIT KEYS.JS";
