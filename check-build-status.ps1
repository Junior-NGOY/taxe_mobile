# Script PowerShell pour surveiller le build EAS

Write-Host "🔍 Vérification du statut des builds EAS..." -ForegroundColor Cyan
Write-Host ""

# Vérifier le dernier build
$output = eas build:list --limit 1 --json 2>&1

if ($LASTEXITCODE -eq 0) {
    $builds = $output | ConvertFrom-Json
    
    if ($builds.Count -gt 0) {
        $lastBuild = $builds[0]
        
        Write-Host "📦 Dernier build:" -ForegroundColor Yellow
        Write-Host "  ID: $($lastBuild.id)"
        Write-Host "  Plateforme: $($lastBuild.platform)"
        Write-Host "  Statut: $($lastBuild.status)"
        Write-Host "  Profil: $($lastBuild.buildProfile)"
        Write-Host ""
        
        if ($lastBuild.status -eq "in-progress" -or $lastBuild.status -eq "pending") {
            Write-Host "⏳ Build en cours..." -ForegroundColor Yellow
            Write-Host "🔗 Suivre sur: https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds/$($lastBuild.id)"
        } elseif ($lastBuild.status -eq "finished") {
            Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
            Write-Host "📥 Télécharger: $($lastBuild.artifacts.buildUrl)"
        } elseif ($lastBuild.status -eq "errored") {
            Write-Host "❌ Build échoué!" -ForegroundColor Red
            Write-Host "🔗 Voir les logs: https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds/$($lastBuild.id)"
        }
    } else {
        Write-Host "⚠️ Aucun build trouvé" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Erreur lors de la vérification" -ForegroundColor Red
}
