#!/usr/bin/expect -f

set timeout -1
# set gate $1
# set user $2
# set password $3
# set pfx $4
# set pass_phrase $5

spawn sudo openconnect --protocol=fortinet -u $2 -c $4 $1 --no-dtls

puts $1
puts $2
puts $3
puts $4
puts $5

expect "Enter PKCS#12 pass phrase:"
send -- "$5\r"

expect "Enter 'yes' to accept, 'no' to abort; anything else to view: "
send -- "yes\r"

expect "Password: "
send -- "$3\r"

expect eof
