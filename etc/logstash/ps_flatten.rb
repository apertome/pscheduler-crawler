def filter ( event )
	failures = 0
	success = 0
	archive_errors = ''
	event.get('archivings').each do |archive|
		if archive['archived']
			success += 1
		else
			failures += 1
		end
		if archive['diags']
			archive['diags'].each do |diag|
				unless diag['stderr'] == ""
					archive_errors += diag['stderr'] + ', '
				end
				#stdout = diag['stdout']
				#diag.set('stdout', stdout.to_s);
				diag.delete('stdout')
				# if diag['stdout'].is_a?(String)
				# 	diag.delete('stdout')
				# 	# diag.set('stdout', {'stdout' =>stdout})
				# 	puts 'stdout ' + stdout.to_s
				# 	# event.set( diag['stdout'], {'stdout' =>''} )
				# 	
				# end
			end
		end
	end
	# event.set('archive', archive);
	event.set('crawler.archive-failures', failures)
	event.set('crawler.archive-success', success)
	event.set('crawler.archive-errors', archive_errors)
	return [event]
end
