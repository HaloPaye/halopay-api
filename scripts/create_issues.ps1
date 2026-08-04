# GitHub Issue Creation Script for Drips Wave Approval
# Target Repository: halopay-api
# Format: Drips Wave Issue Classification (Trivial, Medium, High Points)

Write-Host "Creating Drips Wave Planned Issues for halopay-api..." -ForegroundColor Green

# 1. Trivial Issue (1 Point)
Write-Host "Creating Trivial issue..." -ForegroundColor Cyan
gh issue create `
  --title "[Trivial] Update API documentation and environment variable configuration guidance" `
  --body "## Summary`nUpdate README.md and CONTRIBUTING.md with complete SEP-10, SEP-12, and SEP-24 environment configuration guide.`n`n## Points`n- **Points**: 1 (Trivial)`n`n## Acceptance Criteria`n- Clear step-by-step setup docs for local development`n- Complete API endpoint description table" `
  --label "documentation,good first issue"

# 2. Medium Issue (3 Points)
Write-Host "Creating Medium issue..." -ForegroundColor Cyan
gh issue create `
  --title "[Medium] Enhance SEP-12 multipart binary photo upload and cloud storage integration" `
  --body "## Summary`nExtend binary ID upload handling in sep12.service.ts to stream validated government ID images directly to secure object storage.`n`n## Points`n- **Points**: 3 (Medium)`n`n## Acceptance Criteria`n- Secure S3/GCS bucket upload for id_photo_front, id_photo_back, and selfie`n- Signed temporary URLs generated for anchor compliance review" `
  --label "enhancement,kyc"

# 3. High Issue (5 Points)
Write-Host "Creating High issue..." -ForegroundColor Cyan
gh issue create `
  --title "[High] Implement Stellar Horizon payment stream reconnect & Soroban contract event listener" `
  --body "## Summary`nAdd exponential backoff automatic reconnection logic to Horizon payment listener and subscribe to Soroban payment contract events.`n`n## Points`n- **Points**: 5 (High)`n`n## Acceptance Criteria`n- Resilient SSE/WebSocket connection management with automatic retry`n- Real-time Soroban cross-border settlement event decoding and WebSocket broadcast" `
  --label "feature,architecture,stellar"

Write-Host "Drips Wave issues created successfully!" -ForegroundColor Green
