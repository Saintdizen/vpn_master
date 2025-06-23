#!/usr/bin/expect -f

set timeout -1
set gate [lindex $argv 0];
set user [lindex $argv 1];
set password [lindex $argv 2];
set pfx [lindex $argv 3];
set pass_phrase [lindex $argv 4];

spawn sudo openconnect --protocol=fortinet -u $user -c $pfx $gate --no-dtls
set bash_pid [exp_pid]
puts "Spawn PID: $bash_pid"

expect "Enter PKCS#12 pass phrase:"
send -- "$pass_phrase\r"

expect "Enter 'yes' to accept, 'no' to abort; anything else to view: "
send -- "yes\r"

expect "Password: "
send -- "$password\r"

expect eof
